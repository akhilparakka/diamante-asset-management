/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showMintForm, setShowMintForm] = useState(false);
  const [showServerForm, setShowServerForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [assetName, setAssetName] = useState("");
  const [hideMainContent, setHideMainContent] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [notification, setNotification] = useState("");

  async function connectWallet() {
    if (window.diam) {
      try {
        const result = await window.diam.connect();
        const diamPublicKey = result.message[0].diamPublicKey;
        if (!diamPublicKey) {
          setNotification("Please try again");
          return;
        }
        console.log(`User active public key is: ${diamPublicKey}`);
        localStorage.setItem("publicKey", diamPublicKey);
        setPublicKey(diamPublicKey);
        setIsWalletConnected(true);
        setNotification(""); // Clear the notification on successful connection
        return diamPublicKey;
      } catch (error) {
        console.error(`Error: ${error}`);
        setNotification("Failed to connect wallet");
        throw new Error("failed to connect wallet");
      }
    } else {
      setNotification("Wallet extension not found");
      throw new Error("Wallet extension not found");
    }
  }

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleAssetNameChange = (event) => {
    setAssetName(event.target.value);
  };

  const handleMint = () => {
    console.log("Minting NFT with image:", imageFile);
    console.log("Asset Name:", assetName);
  };

  const handleUserNFTClick = () => {
    setShowMintForm(true);
    setShowServerForm(false);
    setHideMainContent(true);
    window.history.pushState(null, null, window.location.pathname);
  };

  const handleServerNFTClick = () => {
    setShowMintForm(false);
    setShowServerForm(true);
    setHideMainContent(true);
    window.history.pushState(null, null, window.location.pathname);
  };

  useEffect(() => {
    const handlePopState = () => {
      setShowMintForm(false);
      setShowServerForm(false);
      setHideMainContent(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="App">
      {notification && <div className="notification">{notification}</div>}
      {!hideMainContent && (
        <>
          <h1 className={isWalletConnected ? "hidden" : ""}>Welcome To Diam NFT</h1>
          {isWalletConnected ? (
            <div className="full-screen-buttons">
              <button onClick={handleUserNFTClick}>User NFT</button>
              <button onClick={handleServerNFTClick}>Server NFT</button>
            </div>
          ) : (
            <button onClick={() => connectWallet()}>Connect Your Wallet</button>
          )}
        </>
      )}

      {showMintForm && (
        <div className="mint-form">
          <div className="public-key-container">
            <p>Public Key: {publicKey}</p>
          </div>
          <h1>User Mint</h1>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <input
            type="text"
            placeholder="Asset Name"
            value={assetName}
            onChange={handleAssetNameChange}
          />
          <button onClick={handleMint}>Mint</button>
        </div>
      )}

      {showServerForm && (
        <div className="server-form">
          <p>Server NFT</p>
        </div>
      )}
    </div>
  );
}

export default App;
