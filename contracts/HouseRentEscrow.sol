// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract HouseRentEscrow {
    using Address for address payable;

    IERC721 public nft; // The NFT representing the house
    IERC20 public token; // The ERC20 token used for payment
    address public owner; // The owner of the contract
    uint256 public rentalFee; // The rental fee for the house in token
    uint256 public depositAmount; // The deposit required to rent the house in token
    uint256 public rentalDuration; // The duration of the rental period in seconds
    uint256 public startTimestamp; // The timestamp when the rental period starts
    address public renter; // The address of the renter
    address public landlord; // The address of the landlord
    bool public landlordApproval; // The approval status of the landlord

    enum State {Created, Started, Terminated}
    State public state;

    event RentalFeeUpdated(uint256 rentalFee);
    event DepositAmountUpdated(uint256 depositAmount);
    event RentalDurationUpdated(uint256 rentalDuration);
    event RenterUpdated(address renter);
    event LandlordApprovalUpdated(bool landlordApproval);
    event RentalStarted(uint256 startTimestamp);
    event RentalTerminated();

    constructor(
        address _nft,
        address _token,
        uint256 _rentalFee,
        uint256 _depositAmount,
        uint256 _rentalDuration
    ) {
        nft = IERC721(_nft);
        token = IERC20(_token);
        owner = msg.sender;
        rentalFee = _rentalFee;
        depositAmount = _depositAmount;
        rentalDuration = _rentalDuration;
        state = State.Created;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    modifier onlyRenter() {
        require(msg.sender == renter, "Only renter can call this function.");
        _;
    }

    modifier inState(State _state) {
        require(state == _state, "Invalid state.");
        _;
    }

    function updateRentalFee(uint256 _rentalFee) public onlyOwner {
        rentalFee = _rentalFee;
        emit RentalFeeUpdated(rentalFee);
    }

    function updateDepositAmount(uint256 _depositAmount) public onlyOwner {
        depositAmount = _depositAmount;
        emit DepositAmountUpdated(depositAmount);
    }

    function updateRentalDuration(uint256 _rentalDuration) public onlyOwner {
        rentalDuration = _rentalDuration;
        emit RentalDurationUpdated(rentalDuration);
    }

    function updateRenter(address _renter) public onlyOwner {
        require(state == State.Created, "Cannot update renter after rental has started.");
        renter = _renter;
        emit RenterUpdated(renter);
    }

    function approveLandlord() public onlyRenter inState(State.Started) {
        require(!landlordApproval, "Landlord has already approved the rental.");
        landlordApproval = true;
        emit LandlordApprovalUpdated(landlordApproval);
    }

    function startRental() public inState(State.Created) {
        require(renter != address(0), "Renter must be set before starting rental");
        require(nft.ownerOf(1) == address(this), "The NFT must be transferred to this contract");
    }
}