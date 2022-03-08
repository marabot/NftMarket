//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";



contract MazeNFT is ERC721URIStorage,  Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;                
    mapping(address=>uint[]) tokenIdsByOwner;


    constructor() ERC721("MazeNFT", "M_NFT") {}
    
    function mintNFT(address recipient, string memory tokenURI)
        public 
        
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        uint[] storage ownnerTokens= tokenIdsByOwner[recipient];
        ownnerTokens.push(newItemId);
        return newItemId;
    }

    function getTokenIdsOfOwner(address own) public view returns(uint[] memory){
        return tokenIdsByOwner[own];
    }
}
