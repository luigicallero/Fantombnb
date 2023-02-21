//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress;
    address payable public houseOwner;

    modifier onlyRenter(uint256 _nftID) {
        require(msg.sender == renter[_nftID], "Only renter can call this method");
        _;
    }

    modifier onlyHouseOwner() {
        require(msg.sender == houseOwner, "Only houseOwner can call this method");
        _;
    }

// ??? Could be replaced with Struct
    mapping(uint256 => bool) public isForRent;
    mapping(uint256 => uint256) public rentPrice;
    mapping(uint256 => uint256) public depositPrice;
    mapping(uint256 => address) public renter;
    mapping(uint256 => address) public houseOwnership;
    mapping(uint256 => mapping(address => bool)) public approval;

    constructor(
        address _nftAddress,
        address payable _houseOwner
    ) {
        nftAddress = _nftAddress;
        houseOwner = _houseOwner;
    }

    function setForRent(
        uint256 _nftID,
        address _houseOwner,
        uint256 _rentPrice,
        uint256 _depositPrice
    ) public payable onlyHouseOwner {
        // Transfer NFT from houseOwner to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isForRent[_nftID] = true;
        rentPrice[_nftID] = _rentPrice;
        depositPrice[_nftID] = _depositPrice;
        houseOwnership[_nftID] = _houseOwner;
    }

    // Put Under Contract (only renter - payable escrow)
    function depositEarnest(uint256 _nftID) public payable onlyRenter(_nftID) {
        require(msg.value >= depositPrice[_nftID]);
    }

    // Update Inspection Status (only inspector)
    // function updateInspectionStatus(uint256 _nftID, bool _passed)
    //     public
    //     onlyInspector
    // {
    //     inspectionPassed[_nftID] = _passed;
    // }

    // Approve Sale
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    // Finalize Sale
    // -> Require inspection status (add more items here, like appraisal)
    // -> Require sale to be authorized
    // -> Require funds to be correct amount
    // -> Transfer NFT to renter
    // -> Transfer Funds to houseOwner
    function finalizeSale(uint256 _nftID) public {
//        require(inspectionPassed[_nftID]);
        require(approval[_nftID][renter[_nftID]]);
        require(approval[_nftID][houseOwner]);
        //require(approval[_nftID][lender]);
        require(address(this).balance >= rentPrice[_nftID]);

        isForRent[_nftID] = false;

        (bool success, ) = payable(houseOwner).call{value: address(this).balance}(
            ""
        );
        require(success);

        IERC721(nftAddress).transferFrom(address(this), renter[_nftID], _nftID);
    }

    // Cancel Sale (handle earnest deposit)
    // -> if approval status is not approved, then refund, otherwise send to houseOwner
    function cancelSale(uint256 _nftID) public {
        if (approval[_nftID][houseOwner] == false) {
            payable(renter[_nftID]).transfer(address(this).balance);
        } else {
            payable(houseOwner).transfer(address(this).balance);
        }
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}


// Missing events
// Missing renter, houseOwner identification - should be seemless: if I hit buy then I am renter (unless I own the NFT)
// Need to remove the lender and inspector of the code
// This contract could mint new NFTs