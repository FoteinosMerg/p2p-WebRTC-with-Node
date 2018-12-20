"use strict";

const Elliptic = require("elliptic");
const ellipticCurve = new Elliptic.ec("secp256k1");
const sha256 = require("crypto-js/sha256");

function verifySignature(publicKey, signature, body) {
  return ellipticCurve
    .keyFromPublic(publicKey, "hex")
    .verify(body, signature);
}

class Signer {
  static genKeyPair() {
    return ellipticCurve.genKeyPair();
  }

  static verify(data) {
    return verifySignature(
      data.header.publicKey,
      data.header.signature,
      sha256(JSON.stringify(data.body)).toString()
    );
  }
}

module.exports = Signer;
