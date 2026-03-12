// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certification {
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    struct Diploma {
        uint256 id;
        string studentName;
        string major;
        string classification;
        uint256 issueDate;
        bool isValid;
    }

    mapping(uint256 => Diploma) public diplomas;

    event DiplomaIssued(uint256 indexed id, string studentName);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Chi Admin moi duoc thuc hien");
        _;
    }

    function issueDiploma(uint256 _id, string memory _name, string memory _major, string memory _class) public onlyAdmin {
        require(diplomas[_id].id == 0, "ID nay da ton tai");
        diplomas[_id] = Diploma(_id, _name, _major, _class, block.timestamp, true);
        emit DiplomaIssued(_id, _name);
    }

    function verifyDiploma(uint256 _id) public view returns (string memory, string memory, string memory, uint256, bool) {
        require(diplomas[_id].id != 0, "Khong tim thay bang cap");
        Diploma memory d = diplomas[_id];
        return (d.studentName, d.major, d.classification, d.issueDate, d.isValid);
    }
}