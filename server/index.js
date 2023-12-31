const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "0x047da73ab0b6c56b49522db06fd07f26237cf28c": 100,
  "0xb7656ac76316050b3b53c5e1e297ac71a29881c6": 50,
  "0xa19bc3d0360687c0f64523e7cb9c6879264593c8": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async(req, res) => {
  const { sender, recipient, amount, signature, msghash } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);
  const { r, s , recovery } = signature;
  const signatureInstance = new secp.secp256k1.Signature(BigInt(r), BigInt(s), recovery);
  const recoverPublicKey = signatureInstance.recoverPublicKey(msghash);

  const publicKey = recoverPublicKey.toHex(true);

  const address = toHex(keccak256(hexToBytes(publicKey.slice(2))).slice(-20));
  const publicAddress=`0x${address}`
  
  if( publicAddress!== sender) {
    res.status(400).send({ message: "Invalid signature! Please Use Private Key of Same address" });
    return;
  }
  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

async function recoverKey(msgHash, signature, recoveryBit) {
    return secp.recoverPublicKey(msgHash, signature, recoveryBit);   
}
function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
