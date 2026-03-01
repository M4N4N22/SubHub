import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🔥 RUNNING CUSTOM DEPLOY 🔥");
  console.log("Deploying PaymentManager with:", deployer.address);

  const subscriptionPlanAddress =
    "0x5D74e97d70afaF41586F3ccC75127AcAee9B37E1";

  const usdcAddress =
    "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";

  const permit2Address =
    "0x000000000022D473030F116dDEE9F6B43aC78BA3";

  const PaymentManager = await ethers.getContractFactory("PaymentManager");

  const paymentManager = await PaymentManager.deploy(
    subscriptionPlanAddress,
    usdcAddress,
    permit2Address
  );

  await paymentManager.deployed();

  console.log("PaymentManager deployed at:", paymentManager.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});