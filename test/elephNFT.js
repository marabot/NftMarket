// We import Chai to use its asserting functions here.
const { _nameprepTableB2 } = require("@ethersproject/strings/lib/idna");
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ContractType } = require("hardhat/internal/hardhat-network/stack-traces/model");
//const { ethers} = require("hardhat");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Token contract", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Market;
  let Token;
  let NftMarket;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addrs;

  let provider;
  let tokenId1;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("ElephNFT");
    Market = await ethers.getContractFactory("NFTmarket");
    [owner, addr1, addr2,addr3, addr4, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatToken = await Token.deploy();
    NftMarket = await Market.deploy()
    let ret = await hardhatToken.mintNFT(owner.getAddress(),"https://gateway.pinata.cloud/ipfs/QmYQVX1hN5ACgiDNcKrTyNAAnGLybpfBH59aGaJ19DFiWz");
    const rec = await ret.wait();
    tokenId1 = Number(rec.events[0].topics[3]);
    //console.log(tokenId1);

    provider = ethers.provider;
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
    
      expect(await hardhatToken.owner()).to.equals(owner.address);
    });

   
    it("Should deposit a nft", async function () {
      let ret = await NftMarket.depositNFT(hardhatToken.address, tokenId1,5);

      let NFT= await NftMarket.getNFTById('1');
 
     // console.log(NFT.contractAddr);
      expect(NFT.contractAddr).to.equals(hardhatToken.address);

    });

    it("Should put an offer", async function () {

      let oneWeek= 6.048e+8;
      let timeTo2Week = Date.now() + 2*oneWeek;
      let tx = await NftMarket.depositNFT(hardhatToken.address, tokenId1,ethers.utils.parseEther('10'));
      const txrec = await tx.wait();
     // console.log(txrec);

    // endtime 2024 => 1709139601000
     let retOffer=await NftMarket.connect(addr2).newOffer('1', ethers.utils.parseEther("5"), '1709139601000', {value:ethers.utils.parseEther("5")});
     const offer = await NftMarket.getOffersByNFT('1');
     let offerArray= offer.toString().split(',');
    
     
     expect(offerArray[1]).to.equals(addr2.address);
     expect(offerArray[2]).to.equals('1');
     expect(Math.round(ethers.utils.formatEther(offerArray[3]))).to.equals(5);
     expect(offerArray[4]).to.equals('1709139601000');
    });


    it("Should accept offer", async function () {

      let oneWeek= 6.048e+8;
      let timeTo2Week = Date.now() + 2*oneWeek;
      let tx = await NftMarket.depositNFT(hardhatToken.address,  tokenId1,ethers.utils.parseEther('10'));
      const txrec = await tx.wait();
     // console.log(txrec);

     [sb, sb1, ]= await Promise.all(
      [        
         provider.getBalance(owner.address),
         provider.getBalance(addr1.address),
       
      ]
    );
   // [sb, sb1].map( el=>{console.log(el)});
    
     let retOffer=await NftMarket.connect(addr1).newOffer('1', ethers.utils.parseEther("5"), '1709139601000', {value:ethers.utils.parseEther("5")});

     let own = await hardhatToken.ownerOf('1');
    // console.log('owner before : ' + own);

     let nft = await NftMarket.getNFTById('1');

     hardhatToken.approve(NftMarket.address, '1');
     await NftMarket.connect(owner).acceptOffer('1', '1');
     
     const offer = await NftMarket.getOffersByNFT('1');
     let offerArray= offer.toString().split(',');
    
     [b, b1, ]= await Promise.all(
      [        
         provider.getBalance(owner.address),
         provider.getBalance(addr1.address),
       
      ]
    );
    //[b,  b1].map( el=>{console.log(el)});
    
    expect(Math.round(ethers.utils.formatEther(b))).to.equals(Math.round(ethers.utils.formatEther(sb))+5);
    expect(Math.round(ethers.utils.formatEther(b1))).to.equals(Math.round(ethers.utils.formatEther(sb1))-5);
  
     
     expect(offerArray[1]).to.equals(addr1.address);
     expect(offerArray[2]).to.equals('1');
     expect(Math.round(ethers.utils.formatEther(offerArray[3]))).to.equals(5);
     expect(offerArray[4]).to.equals('0');
     

    });

    it("Should accept automatically", async function () {

      let oneWeek= 6.048e+8;
      let timeTo2Week = Date.now() + 2*oneWeek;
      let tx = await NftMarket.depositNFT(hardhatToken.address, tokenId1,ethers.utils.parseEther('10'));
      const txrec = await tx.wait();
     // console.log(txrec);

     hardhatToken.approve(NftMarket.address, '1');
     await NftMarket.connect(addr2).newOffer('1', ethers.utils.parseEther("15"), '1709139601000', {value:ethers.utils.parseEther("15")});

     let own = await hardhatToken.ownerOf('1');
    // console.log('owner before : ' + own);

     let offer = await NftMarket.getOffersByNFT('1');
     console.log(offer);
    // own =await hardhatToken.ownerOf('1');
     //console.log('owner after : ' + own);

    });

    it("Should resend unaccepted offers", async function () {
      let b, b1, b2,b3;
      let oneWeek= 6.048e+8;
      let timeTo2Week = Date.now() + 2*oneWeek;
      let tx = await NftMarket.depositNFT(hardhatToken.address, tokenId1,ethers.utils.parseEther('10'));
      const txrec = await tx.wait();
     // console.log(txrec);
    let sb,sb1, sb2, sb3;
     [sb,  sb1, sb2,  sb3]= await Promise.all(
      [        
         provider.getBalance(owner.address),
         provider.getBalance(addr1.address),
         provider.getBalance(addr2.address),
         provider.getBalance(addr3.address)
      ]
    );
     hardhatToken.approve(NftMarket.address, '1');
     let retOffer=await NftMarket.connect(addr2).newOffer('1', ethers.utils.parseEther("5"), '1709139601000', {value:ethers.utils.parseEther("5")});
     let retOffer2=await NftMarket.connect(addr3).newOffer('1', ethers.utils.parseEther("6"), '1709139601000', {value:ethers.utils.parseEther("6")});
     
     [b,  b1, b2,  b3]= await Promise.all(
      [        
         provider.getBalance(owner.address),
         provider.getBalance(addr1.address),
         provider.getBalance(addr2.address),
         provider.getBalance(addr3.address)
      ]
    );
    //[b,  b1, b2,  b3].map( el=>{console.log(el)});
    //console.log(Math.round(ethers.utils.formatEther(b2)));
    expect(Math.round(ethers.utils.formatEther(b2))).to.equals(Math.round(ethers.utils.formatEther(sb2) - 5));
    expect(Math.round(ethers.utils.formatEther(b3))).to.equals(Math.round(ethers.utils.formatEther(sb3) - 6));


     let retOffer3=await NftMarket.connect(addr1).newOffer('1', ethers.utils.parseEther("15"), '1709139601000', {value:ethers.utils.parseEther("15")});

     let offers = await NftMarket.getOffersByNFT('1');
     //console.log(offers);
     expect(offers[0].endtime=='0');
     expect(offers[1].endtime=='0');
      
     let own = await hardhatToken.ownerOf('1');
     // console.log('owner before : ' + own);
   
     [b,  b1, b2,  b3]= await Promise.all(
       [        
          provider.getBalance(owner.address),
          provider.getBalance(addr1.address),
          provider.getBalance(addr2.address),
          provider.getBalance(addr3.address)
       ]
     );
     [b,  b1, b2,  b3].map( el=>{console.log(el)});
     
     expect(Math.round(ethers.utils.formatEther(b2))).to.equals(Math.round(ethers.utils.formatEther(sb2)));
    expect(Math.round(ethers.utils.formatEther(b3))).to.equals(Math.round(ethers.utils.formatEther(sb3)));
    expect(Math.round(ethers.utils.formatEther(b1))).to.equals(Math.round(ethers.utils.formatEther(sb1))-15);
    expect(Math.round(ethers.utils.formatEther(b))).to.equals(Math.round(ethers.utils.formatEther(sb))+15);   
 

    });
  }); 
});