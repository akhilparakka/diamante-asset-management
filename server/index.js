import express from "express";
import bodyParser from "body-parser";
import {
  Keypair,
  BASE_FEE,
  TransactionBuilder,
  Aurora,
  Networks,
  Operation,
  Asset,
} from "diamnet-sdk";
import multer from "multer";
import { create } from "ipfs-http-client";

const app = express();
const port = 3000;

app.use(bodyParser.json());
const upload = multer({ storage: multer.memoryStorage() });

app.post("/createAsset", upload.single("image"), async (req, res) => {
  try {
    const { userAddress, assetName } = req.body;
    const imageBuffer = req.file.buffer;

    if (!userAddress || !assetName || !imageBuffer) {
      return res
        .status(400)
        .json({ error: "userAddress, assetName, and image are required" });
    }

    const masterKeypair = Keypair.fromSecret(
      "SAAW2UGWLV2SOP2GULMDXK4NTHQT3JXUNFYAKFRMRPR2DA7A4QY5VMWK"
    );

    const ipfsClient = create({
      url: "https://uploadipfs.diamcircle.io",
    });
    const ipfsResult = await ipfsClient.add(imageBuffer);

    const issuerkeypair = Keypair.random();

    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

    const asset = new Asset(assetName, issuerkeypair.publicKey());

    const masterAccount = await server.loadAccount(masterKeypair.publicKey());

    const numOperations = 6;
    const totalFee = ((BASE_FEE * numOperations) / Math.pow(10, 7)).toString();

    const tx = new TransactionBuilder(masterAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: masterKeypair.publicKey(),
          asset: Asset.native(),
          amount: totalFee,
          source: userAddress,
        })
      )
      .addOperation(
        Operation.createAccount({
          destination: issuerkeypair.publicKey(),
          startingBalance: "0.000001",
        })
      )
      .addOperation(
        Operation.changeTrust({
          asset: asset,
          source: userAddress,
        })
      )
      .addOperation(
        Operation.manageData({
          name: assetName,
          source: issuerkeypair.publicKey(),
          value: ipfsResult.path,
        })
      )
      .addOperation(
        Operation.payment({
          destination: userAddress,
          source: issuerkeypair.publicKey(),
          asset: asset,
          amount: "0.0000001",
        })
      )
      .addOperation(
        Operation.setOptions({
          source: issuerkeypair.publicKey(),
          masterWeight: 0,
        })
      )
      .setTimeout(0)
      .build();

    tx.sign(masterKeypair, issuerkeypair);

    const xdr = tx.toXDR();

    res.status(200).json({
      message: "Asset creation request received",
      xdr: xdr,
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
