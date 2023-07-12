import { useState } from "react";
import server from "./server";
import Modal from "./components/Modal";
import { hashMessage } from "./utils/helperfunctions";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { hexToBytes } from "ethereum-cryptography/utils";
import { toast } from "react-toastify";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [privKey, setPrivKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function SignAndTransfer(evt) {
    evt.preventDefault();
    let msg = `Transfer ${sendAmount} from ${address} to ${recipient}`;
    const msghash = hashMessage(msg);
    // Convert the hexadecimal representation of the private key received from the user to binary
    const privateKeyBinary = hexToBytes(privKey);

    const signatureM = await secp256k1.sign(msghash, privateKeyBinary);
    const signatureSerialized = {
      r: signatureM.r.toString(),
      s: signatureM.s.toString(),
      recovery: signatureM.recovery,
    };
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: signatureSerialized,
        msghash,
      });
      setBalance(balance);
      toast.success(
        `Transaction executed successfully New Balance:${balance}`,
        {
          position: toast.POSITION.TOP_RIGHT,
          theme: "light",
          icon: "🚀",
          autoClose: 7000,
        }
      );
      setIsOpen(false);
    } catch (ex) {
      toast.error(`Uhh uh 😕${ex.response.data.message}`, {
        position: toast.POSITION.TOP_RIGHT,
        theme: "light",
        autoClose: 8000,
      });
    }
  }
  const openModal = () => {
    setIsOpen(true);
  };

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

      <input
        type="button"
        onClick={openModal}
        className="button"
        value="Transfer"
      />
      {isOpen && <Modal setPrivKey={setPrivKey} setIsOpen={setIsOpen} />}
    </form>
  );
}

export default Transfer;
