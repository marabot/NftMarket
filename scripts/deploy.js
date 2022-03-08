async function main() {
    const MazeNFT = await ethers.getContractFactory("MazeNFT");
    const NftMarket = await ethers.getContractFactory("NFTmarket");
    
  
    // Start deployment, returning a promise that resolves to a contract object
    const M_NFT = await MazeNFT.deploy()
    await M_NFT.deployed()
    console.log("Contract MazeNft deployed to address:", M_NFT.address)
    const NFTmarket = await NftMarket.deploy()
    await NFTmarket.deployed()
    console.log("Contract NFTmarket deployed to address:", NFTmarket.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  