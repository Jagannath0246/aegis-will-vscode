// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AegisWill
 * @notice On-chain digital will with beneficiary shares and inactivity trigger.
 * @dev Deploy via Remix IDE with Injected Provider (MetaMask) on Sepolia or Mainnet.
 *
 * ─── REMIX DEPLOY STEPS ───────────────────────────────────────────────────────
 * 1. Open https://remix.ethereum.org
 * 2. Create new file "AegisWill.sol" and paste this code
 * 3. In the Solidity Compiler tab: select 0.8.20, enable optimization
 * 4. In the Deploy tab: select "Injected Provider - MetaMask"
 * 5. Pass constructor args:  _name (string), _inactivityDays (uint256 e.g. 365)
 * 6. Click Deploy, confirm MetaMask transaction
 * 7. Copy the deployed contract address and paste it in Aegis Will dashboard
 * ──────────────────────────────────────────────────────────────────────────────
 */
contract AegisWill {

    // ─── STRUCTS ───────────────────────────────────────────────────────────────

    struct Beneficiary {
        address payable wallet;
        uint256 shareBps;   // basis points (10000 = 100%)
        string  name;
        bool    active;
    }

    struct AssetEntry {
        string  assetType;  // "ETH", "ERC20", "ERC721", etc.
        string  name;
        address contractAddr;
        uint256 amount;
        bool    active;
    }

    // ─── STATE ────────────────────────────────────────────────────────────────

    address public owner;
    string  public willName;
    string  public executor;
    uint256 public inactivitySeconds;
    uint256 public lastPing;
    bool    public executed;
    bool    public paused;

    Beneficiary[] public beneficiaries;
    AssetEntry[]  public assets;

    // ─── EVENTS ───────────────────────────────────────────────────────────────

    event WillCreated(address indexed owner, string name, uint256 timestamp);
    event BeneficiaryAdded(address indexed wallet, string name, uint256 shareBps);
    event BeneficiaryRemoved(address indexed wallet);
    event AssetAdded(string assetType, string name, uint256 amount);
    event OwnerPinged(address indexed owner, uint256 timestamp);
    event WillExecuted(address indexed executor, uint256 timestamp);
    event ETHReceived(address indexed sender, uint256 amount);
    event WillPaused(bool paused);
    event ExecutorUpdated(string newExecutor);
    event InactivityUpdated(uint256 newSeconds);

    // ─── MODIFIERS ────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "AegisWill: not owner");
        _;
    }

    modifier notExecuted() {
        require(!executed, "AegisWill: already executed");
        _;
    }

    modifier notPaused() {
        require(!paused, "AegisWill: paused");
        _;
    }

    // ─── CONSTRUCTOR ──────────────────────────────────────────────────────────

    constructor(string memory _name, uint256 _inactivityDays) {
        require(_inactivityDays >= 30, "AegisWill: min 30 days inactivity");
        owner               = msg.sender;
        willName            = _name;
        inactivitySeconds   = _inactivityDays * 1 days;
        lastPing            = block.timestamp;
        emit WillCreated(msg.sender, _name, block.timestamp);
    }

    // ─── RECEIVE ETH ──────────────────────────────────────────────────────────

    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    // ─── OWNER ACTIONS ────────────────────────────────────────────────────────

    /**
     * @notice Owner pings to reset the inactivity timer.
     * @dev Call this at least once every `inactivitySeconds` to prevent execution.
     */
    function ping() external onlyOwner notExecuted {
        lastPing = block.timestamp;
        emit OwnerPinged(msg.sender, block.timestamp);
    }

    /**
     * @notice Add or update a beneficiary.
     * @param _wallet   Beneficiary wallet address
     * @param _name     Human-readable name
     * @param _shareBps Share in basis points (10000 = 100%)
     */
    function addBeneficiary(
        address payable _wallet,
        string calldata _name,
        uint256 _shareBps
    ) external onlyOwner notExecuted {
        require(_wallet != address(0), "AegisWill: zero address");
        require(_shareBps > 0 && _shareBps <= 10000, "AegisWill: invalid share");
        require(totalShareBps() + _shareBps <= 10000, "AegisWill: total > 100%");

        beneficiaries.push(Beneficiary({
            wallet:   _wallet,
            shareBps: _shareBps,
            name:     _name,
            active:   true
        }));
        emit BeneficiaryAdded(_wallet, _name, _shareBps);
    }

    /**
     * @notice Remove a beneficiary by index.
     */
    function removeBeneficiary(uint256 _index) external onlyOwner notExecuted {
        require(_index < beneficiaries.length, "AegisWill: bad index");
        address wallet = beneficiaries[_index].wallet;
        beneficiaries[_index].active = false;
        emit BeneficiaryRemoved(wallet);
    }

    /**
     * @notice Record an asset entry (metadata only for non-ETH assets).
     */
    function addAsset(
        string calldata _type,
        string calldata _name,
        address _contractAddr,
        uint256 _amount
    ) external onlyOwner notExecuted {
        assets.push(AssetEntry({
            assetType:    _type,
            name:         _name,
            contractAddr: _contractAddr,
            amount:       _amount,
            active:       true
        }));
        emit AssetAdded(_type, _name, _amount);
    }

    /**
     * @notice Update executor name (off-chain reference).
     */
    function setExecutor(string calldata _executor) external onlyOwner {
        executor = _executor;
        emit ExecutorUpdated(_executor);
    }

    /**
     * @notice Update inactivity threshold.
     */
    function setInactivityDays(uint256 _days) external onlyOwner notExecuted {
        require(_days >= 30, "AegisWill: min 30 days");
        inactivitySeconds = _days * 1 days;
        emit InactivityUpdated(inactivitySeconds);
    }

    /**
     * @notice Pause or unpause the will (emergency stop).
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit WillPaused(_paused);
    }

    // ─── EXECUTION ────────────────────────────────────────────────────────────

    /**
     * @notice Trigger will execution if inactivity period has passed.
     * @dev Anyone can call; execution distributes ETH to beneficiaries by share.
     */
    function triggerExecution() external notExecuted notPaused {
        require(
            block.timestamp >= lastPing + inactivitySeconds,
            "AegisWill: owner still active"
        );
        executed = true;
        _distributeETH();
        emit WillExecuted(msg.sender, block.timestamp);
    }

    /**
     * @notice Owner can self-execute immediately.
     */
    function selfExecute() external onlyOwner notExecuted {
        executed = true;
        _distributeETH();
        emit WillExecuted(msg.sender, block.timestamp);
    }

    // ─── INTERNAL ─────────────────────────────────────────────────────────────

    function _distributeETH() internal {
        uint256 balance = address(this).balance;
        if (balance == 0) return;

        for (uint256 i = 0; i < beneficiaries.length; i++) {
            Beneficiary memory b = beneficiaries[i];
            if (!b.active) continue;
            uint256 amount = (balance * b.shareBps) / 10000;
            if (amount > 0) {
                (bool ok, ) = b.wallet.call{value: amount}("");
                require(ok, "AegisWill: transfer failed");
            }
        }
    }

    // ─── VIEW FUNCTIONS ───────────────────────────────────────────────────────

    /**
     * @notice Returns current will info.
     */
    function getWillInfo() external view returns (
        string memory name,
        address ownerAddr,
        bool isExecuted,
        bool isPaused,
        uint256 createdAtApprox,
        uint256 lastActivity,
        uint256 inactivityThreshold,
        uint256 timeUntilTrigger
    ) {
        name               = willName;
        ownerAddr          = owner;
        isExecuted         = executed;
        isPaused           = paused;
        createdAtApprox    = lastPing; // approximate
        lastActivity       = lastPing;
        inactivityThreshold= inactivitySeconds;
        uint256 deadline   = lastPing + inactivitySeconds;
        timeUntilTrigger   = block.timestamp >= deadline ? 0 : deadline - block.timestamp;
    }

    /**
     * @notice Returns the number of active beneficiaries.
     */
    function getTotalBeneficiaries() external view returns (uint256 count) {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) count++;
        }
    }

    /**
     * @notice Returns ETH balance held by contract.
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Returns total allocated share basis points.
     */
    function totalShareBps() public view returns (uint256 total) {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) total += beneficiaries[i].shareBps;
        }
    }

    /**
     * @notice Check if execution can be triggered right now.
     */
    function canExecute() external view returns (bool) {
        return !executed && !paused && block.timestamp >= lastPing + inactivitySeconds;
    }

    /**
     * @notice Returns all active beneficiaries.
     */
    function getBeneficiaries() external view returns (Beneficiary[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) count++;
        }
        Beneficiary[] memory result = new Beneficiary[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) result[j++] = beneficiaries[i];
        }
        return result;
    }

    /**
     * @notice Returns all active assets.
     */
    function getAssets() external view returns (AssetEntry[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].active) count++;
        }
        AssetEntry[] memory result = new AssetEntry[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].active) result[j++] = assets[i];
        }
        return result;
    }

    /**
     * @notice Reverses the UNIX seconds back into days for easier frontend rendering.
     */
    function getInactivityDays() external view returns (uint256) {
        return inactivitySeconds / 1 days;
    }

    /**
     * @notice Converts the raw Wei asset amount back into whole ETH.
     * @dev This truncates decimals, use only for UI display of whole numbers.
     */
    function getAssetAmountInWholeETH(uint256 _index) external view returns (uint256) {
        require(_index < assets.length, "AegisWill: bad index");
        return assets[_index].amount / 1 ether;
    }
}