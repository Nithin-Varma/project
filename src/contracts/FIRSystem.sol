// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FIRSystem {
    struct FIR {
        uint256 id;
        address complainant;
        string title;
        string description;
        string location;
        uint256 timestamp;
        bool isResolved;
        string status;
    }

    mapping(uint256 => FIR) public firs;
    uint256 public firCount;

    event FIRFiled(uint256 indexed id, address indexed complainant);
    event FIRUpdated(uint256 indexed id);
    event FIRResolved(uint256 indexed id);

    function fileFIR(
        string memory _title,
        string memory _description,
        string memory _location
    ) public {
        firCount++;
        firs[firCount] = FIR(
            firCount,
            msg.sender,
            _title,
            _description,
            _location,
            block.timestamp,
            false,
            "Pending"
        );
        
        emit FIRFiled(firCount, msg.sender);
    }

    function updateFIR(
        uint256 _id,
        string memory _description,
        string memory _status
    ) public {
        require(_id <= firCount, "FIR does not exist");
        require(msg.sender == firs[_id].complainant, "Not authorized");
        
        firs[_id].description = _description;
        firs[_id].status = _status;
        
        emit FIRUpdated(_id);
    }

    function resolveFIR(uint256 _id) public {
        require(_id <= firCount, "FIR does not exist");
        require(msg.sender == firs[_id].complainant, "Not authorized");
        
        firs[_id].isResolved = true;
        firs[_id].status = "Resolved";
        
        emit FIRResolved(_id);
    }

    function getFIR(uint256 _id) public view returns (FIR memory) {
        require(_id <= firCount, "FIR does not exist");
        return firs[_id];
    }

    function getMyFIRs() public view returns (FIR[] memory) {
        uint256 myFirCount = 0;
        
        for (uint256 i = 1; i <= firCount; i++) {
            if (firs[i].complainant == msg.sender) {
                myFirCount++;
            }
        }
        
        FIR[] memory myFirs = new FIR[](myFirCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= firCount; i++) {
            if (firs[i].complainant == msg.sender) {
                myFirs[index] = firs[i];
                index++;
            }
        }
        
        return myFirs;
    }
}