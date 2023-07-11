import { useState } from "react";
import server from "./server";
import Modal from "./components/Modal";
import { hashMessage } from "./utils/helperfunctions";
import * as secp from "ethereum-cryptography/secp256k1"

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isOpen,setIsOpen] = useState(false);
  const  [privKey,setPrivKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function SignAndTransfer(evt) {
    evt.preventDefault();
    let msg=`Transfer ${sendAmount} from ${address} to ${recipient}`
    const msghash = hashMessage(msg);
    const signatureM = await secp.sign(msghash, privKey, { recovered: true });
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signatureM,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }
  const openModal = () => {
    setIsOpen(true);
  }

  return (
    <form className="container transfer" onSubmit={SignAndTransfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="button" onClick={openModal} className="button" value="Transfer" />
      {isOpen&&<Modal setPrivKey={setPrivKey} setIsOpen={setIsOpen}/>}

    </form>
  );
}

export default Transfer;
