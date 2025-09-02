// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CharityPlatform is ReentrancyGuard, Ownable, Pausable {
    struct Charity {
        uint256 id;
        address payable charityWallet;
        address creator;
        string name;
        string description;
        string category;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 createdAt;
        bool isActive;
        bool isVerified;
        // string ipfsHash; // For storing documents on IPFS
    }

    struct Donation {
        uint256 charityId;
        address donor;
        uint256 amount;
        uint256 timestamp;
        string message;
    }

    // State variables
    uint256 private _charityIdCounter;
    uint256 private _donationIdCounter;
    
    mapping(uint256 => Charity) public charities;
    mapping(uint256 => Donation) public donations;
    mapping(address => uint256[]) public userCharities;
    mapping(address => uint256[]) public userDonations;
    mapping(uint256 => uint256[]) public charityDonations;
    
    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFeeRate = 250; // 2.5%
    address payable public feeRecipient;
    
    // Events
    event CharityCreated(
        uint256 indexed charityId,
        address indexed creator,
        address indexed charityWallet,
        string name,
        uint256 targetAmount
    );
    
    event CharityVerified(uint256 indexed charityId, bool verified);
    
    event DonationMade(
        uint256 indexed donationId,
        uint256 indexed charityId,
        address indexed donor,
        uint256 amount,
        string message
    );
    
    event CharityWithdrawal(
        uint256 indexed charityId,
        address indexed charity,
        uint256 amount
    );
    
    event PlatformFeeUpdated(uint256 newFeeRate);

    constructor(address payable _feeRecipient) {
        feeRecipient = _feeRecipient;
        _charityIdCounter = 1;
        _donationIdCounter = 1;
    }

    modifier onlyCharityCreator(uint256 _charityId) {
        require(charities[_charityId].creator == msg.sender, "Not charity creator");
        _;
    }

    modifier charityExists(uint256 _charityId) {
        require(charities[_charityId].id != 0, "Charity does not exist");
        _;
    }

    modifier onlyVerifiedCharity(uint256 _charityId) {
        require(charities[_charityId].isVerified, "Charity not verified");
        _;
    }

    function createCharity (
        address payable _charityWallet,
        string memory _name,
        string memory _description,
        string memory _category,
        uint256 _targetAmount
        
    ) external whenNotPaused returns (uint256) {
        require(_charityWallet != address(0), "Invalid charity wallet");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_targetAmount > 0, "Target amount must be greater than 0");

        uint256 charityId = _charityIdCounter;
        
        charities[charityId] = Charity({
            id: charityId,
            charityWallet: _charityWallet,
            creator: msg.sender,
            name: _name,
            description: _description,
            category: _category,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            createdAt: block.timestamp,
            isActive: true,
            isVerified: false
            
        });

        userCharities[msg.sender].push(charityId);
        _charityIdCounter++;

        emit CharityCreated(charityId, msg.sender, _charityWallet, _name, _targetAmount);
        
        return charityId;
    }

    function verifyCharity(uint256 _charityId, bool _verified) 
        external 
        onlyOwner 
        charityExists(_charityId) 
    {
        charities[_charityId].isVerified = _verified;
        emit CharityVerified(_charityId, _verified);
    }

    function donate(uint256 _charityId, string memory _message) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        charityExists(_charityId) 
        onlyVerifiedCharity(_charityId) 
    {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(charities[_charityId].isActive, "Charity is not active");

        uint256 platformFee = (msg.value * platformFeeRate) / 10000;
        uint256 donationAmount = msg.value - platformFee;

        // Update charity raised amount
        charities[_charityId].raisedAmount += donationAmount;

        // Create donation record
        uint256 donationId = _donationIdCounter;
        donations[donationId] = Donation({
            charityId: _charityId,
            donor: msg.sender,
            amount: donationAmount,
            timestamp: block.timestamp,
            message: _message
        });

        // Update mappings
        userDonations[msg.sender].push(donationId);
        charityDonations[_charityId].push(donationId);
        _donationIdCounter++;

        // Transfer funds
        charities[_charityId].charityWallet.transfer(donationAmount);
        if (platformFee > 0) {
            feeRecipient.transfer(platformFee);
        }

        emit DonationMade(donationId, _charityId, msg.sender, donationAmount, _message);
    }

    function withdrawFunds(uint256 _charityId) 
        external 
        nonReentrant 
        onlyCharityCreator(_charityId) 
        charityExists(_charityId) 
    {
        Charity storage charity = charities[_charityId];
        require(charity.isVerified, "Charity not verified");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        // This function is for emergency withdrawals only
        // Normal donations are sent directly to charity wallet
        charity.charityWallet.transfer(balance);
        
        emit CharityWithdrawal(_charityId, charity.charityWallet, balance);
    }

    function updateCharityStatus(uint256 _charityId, bool _isActive) 
        external 
        onlyCharityCreator(_charityId) 
        charityExists(_charityId) 
    {
        charities[_charityId].isActive = _isActive;
    }

    function updatePlatformFee(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _newFeeRate;
        emit PlatformFeeUpdated(_newFeeRate);
    }

    function updateFeeRecipient(address payable _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient address");
        feeRecipient = _newRecipient;
    }

    // View functions
    function getCharity(uint256 _charityId) 
        external 
        view 
        charityExists(_charityId) 
        returns (Charity memory) 
    {
        return charities[_charityId];
    }

    function getDonation(uint256 _donationId) 
        external 
        view 
        returns (Donation memory) 
    {
        require(donations[_donationId].donor != address(0), "Donation does not exist");
        return donations[_donationId];
    }

    function getUserCharities(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userCharities[_user];
    }

    function getUserDonations(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userDonations[_user];
    }

    function getCharityDonations(uint256 _charityId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return charityDonations[_charityId];
    }

    function getTotalCharities() external view returns (uint256) {
        return _charityIdCounter - 1;
    }

    function getTotalDonations() external view returns (uint256) {
        return _donationIdCounter - 1;
    }

    function getCharityProgress(uint256 _charityId) 
        external 
        view 
        charityExists(_charityId) 
        returns (uint256 raised, uint256 target, uint256 percentage) 
    {
        Charity memory charity = charities[_charityId];
        raised = charity.raisedAmount;
        target = charity.targetAmount;
        percentage = target > 0 ? (raised * 100) / target : 0;
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        feeRecipient.transfer(balance);
    }

    // Fallback function
    receive() external payable {
        revert("Direct payments not allowed");
    }
}