async function main() {
    const ElNFT = await ethers.getContractFactory("ElephNFT")
  
    // Start deployment, returning a promise that resolves to a contract object
    const elNFT = await ElNFT.deploy()
    await elNFT.deployed()
    console.log("Contract deployed to address:", elNFT.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  