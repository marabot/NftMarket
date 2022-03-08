pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract NFTmarket{

    mapping (uint => NFT) nftById;
    mapping(address => uint[]) nftIdByOwner;

    mapping(uint=> Offer) offerById;
    mapping(uint=> uint[]) offerIdByNft;
    mapping(address=> uint[]) offerIdByOwner;                           
                               
    address admin;
    uint nftIdCount;
    uint offerIdCount;

    struct NFT{
        uint nftId;
        address contractAddr;
        uint tokenId;
        uint price;
        address owner;
        bool listed;
    }

    struct Offer{
        uint offerId;
        address payable from;
        uint nftId;
        uint price;
        uint endTime;
    }


    event NFTDepositEvent(address _contract, uint _tokenId, uint _price);
    event newOfferEvent(uint _nftId, uint _price, uint _endTime);

    constructor(){
        admin= msg.sender;       
    }

    function depositNFT(address _contract , uint _tokenId, uint _price) external
    returns (uint)
    {
        nftIdCount++;
        // verif owner à faire
        nftById[nftIdCount] = NFT(nftIdCount,_contract,_tokenId, _price, msg.sender, true);
        uint[] storage senderNfts =  nftIdByOwner[msg.sender];
        senderNfts.push(nftIdCount);
        emit NFTDepositEvent(_contract, _tokenId, _price);
        
        return nftIdCount;
    }

    function newOffer (uint _nftId, uint _price, uint _endTime)  external payable {
        require(msg.value==_price, 'not enough ether sended');

        if (_price >= nftById[_nftId].price)
        {            
            sellNFT(_nftId,msg.sender,_price);  
            resendUnmatchedOffers(_nftId,0x0);         
        }
        else{
              offerIdCount ++ ;
                offerById[offerIdCount] = Offer(offerIdCount,payable(msg.sender),_nftId, _price, _endTime);

                uint[] storage ownerNFT = offerIdByOwner[msg.sender];
                ownerNFT.push(offerIdCount);

                uint[] storage NFTOffers = offerIdByNft[_nftId];
                NFTOffers.push(offerIdCount);

                emit newOfferEvent(_nftId, _price, _endTime);(_nftId, _price, _endTime);      
        }
    }

    function acceptOffer(uint _nftId, uint _offerId)external {
       NFT storage nftToAccept = nftById[_nftId];
       ERC721 NFTContract = ERC721(nftToAccept.contractAddr);
       require(NFTContract.ownerOf(nftToAccept.tokenId) ==msg.sender,'you have to own the NFT');
       sellNFT(_nftId,offerById[_offerId].from, offerById[_offerId].price);
       resendUnmatchedOffers(_nftId,_offerId);

        Offer storage off = offerById[_offerId]; 
        off.endTime = 0;
        
    }

    function resendUnmatchedOffers(uint _nftId,uint offerToExclude) internal{
       uint[] memory offers= offerIdByNft[_nftId];
       for(uint i = 0 ;i<offers.length;i++){
           if (offerToExclude==0x0 || (offerToExclude!=0x0 && offerToExclude != offerById[offers[i]].offerId))
           {
                Offer storage off = offerById[offers[i]];
                (bool success, bytes memory data) = off.from.call{value:off.price}("");
                require(success,'error in refund unaccepted offer');              
                off.endTime = 0;
           }
       }
    }

    function getAllNFTs() external view returns (NFT[] memory){       
        NFT[] memory ret= new NFT[](nftIdCount);
        for(uint i =0 ; i< nftIdCount;i++)
        {
            ret[i] = nftById[i];

        } 
        return  ret;    
    }

    function getOffersByNFT(uint _nftId) external view returns(Offer[] memory){
        uint[] memory offersId = offerIdByNft[_nftId];
        Offer[] memory ret= new Offer[](offersId.length);
        for(uint i =0;i<offersId.length;i++){
            ret[i]=(offerById[offersId[i]]);
        }
        return ret;
    }

    function sellNFT(uint _nftId, address _to, uint _price) internal {
        NFT storage nftToAccept = nftById[_nftId];
        ERC721 NFTContract = ERC721(nftToAccept.contractAddr);    

        (bool success, bytes memory data) = nftToAccept.owner.call{value:_price}("");
        require(success,'error in paiement to  NFT owner');
        NFTContract.safeTransferFrom(nftToAccept.owner, _to, nftToAccept.tokenId);
        nftToAccept.listed=false;
       
    }
 
}