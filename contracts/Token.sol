//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol';

contract Token is ERC20PresetMinterPauser {
    constructor(uint256 initialSupply) ERC20PresetMinterPauser('Token', 'TTT') {
        _setupDecimals(8);
        _mint(_msgSender(), initialSupply);
    } 
}
