const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const cors = require("cors");
const dotenv = require("dotenv");
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
//import mpesa schema
const mpesa = require("./model/mpesa");
//import phonenumbers
const phone = require("./model/phoneNumbers");
//functional phoneNumbers
const functionPhone = require("./model/functionPhone");
//initialize app
const app = express();

//DB connections
dotenv.config();
mongoose.connect(process.env.DB_CONNECT, () => {
  console.log("connected to the db");
});

//middleware
app.use(bodyParser.json());
app.use(cors());

app.get("/access_token", access, (req, res) => {
  res.status(200).json({ access_token: req.access_token });
});
app.get("/register", access, (req, res) => {
  let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
  let auth = "Bearer " + req.access_token;
  request(
    {
      url: url,
      method: "POST",
      headers: {
        Authorization: auth,
      },
      json: {
        ShortCode: 600977,
        ResponseType: "Completed",
        ConfirmationURL: "https://26ac-105-161-205-2.eu.ngrok.io/confirmation",
        ValidationURL: "https://26ac-105-161-205-2.eu.ngrok.io/validation",
      },
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      }
      res.status(200).json(body);
    }
  );
});
app.get("/simulate", access, (req, res) => {
  let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate";
  let auth = "Bearer " + req.access_token;
  request(
    {
      url: url,
      method: "POST",
      headers: {
        Authorization: auth,
      },
      json: {
        ShortCode: "600977",
        CommandID: "CustomerPayBillOnline",
        Amount: "1",
        Msisdn: "254769982944",
        BillRefNumber: "testApi",
      },
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      } else {
        res.status(200).json(body);
      }
    }
  );
});
//balance
app.get("/balance", access, (req, res) => {
  let url = "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query";
  let auth = "Bearer " + req.access_token;
  request(
    {
      url: url,
      method: "POST",
      headers: {
        Authorization: auth,
      },
      json: {
        Initiator: "testapi",
        SecurityCredential:
          "L1zI+Cjt/3NFWzTMKfNNzfsGndbJutIKXn4nPiR8h+4L1/h46GMXA1tE47pmBk6LXZ6p0U0OqkC0wld5t5PeI3AlMASEGqIVm3y2S8omIZS4YB7+iMpx36Y3iDXis3K/sB4foflrOigj+EOF3bvQ2WgQnijueGR8daB2vPkHw77/58VWMiAsbnFjlte6xFIBol7LQ8ketU5N8TXkI19d28MY5w+o5yjK/iyIKLt7tm7Z1lprWZDQDnk9bzygxHqtLMM1XpijOKQFVLuI0RTvcPR+fIqmB6cbU4s5KMFlE/pHJW4wUbXB934j1InkM0ZNeTH3LzMZu+uk2PV33c7+rQ==",
        CommandID: "AccountBalance",
        PartyA: 600991,
        IdentifierType: 4,
        Remarks: "balance ids",
        QueueTimeOutURL: "https://26ac-105-161-205-2.eu.ngrok.io/timeout_url",
        ResultURL: "https://26ac-105-161-205-2.eu.ngrok.io/result_url",
      },
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      } else {
        res.status(200).json(body);
      }
    }
  );
});
app.post("/phone", async (req, res) => {
  let { numValue, amtValue } = req.body;
  const phoneAndAmount = new phone({
    phoneNumbers: numValue._value,
    amount: amtValue._value,
  });
  res.send({ message: `created!!` });
  let id = phoneAndAmount._id;
  /* setTimeout(async () => {
    await phone.create(phoneAndAmount);
    const phoneNumber = await phone.find({
      phoneNumbers: req.body.numValue._value,
    });
    /  console.log(phoneNumber); 
    const existingId = await phone.findById(id);
    let functionalValue = new functionPhone({
      _id: existingId._id,
      phoneNumber: existingId.phoneNumbers,
      amount: existingId.amount,
    });
    let functionalId = await functionPhone.create(functionalValue);
  }, 10000); */
});

/* app.get("/", async (req, res) => {
  let Db_data = phone.find();
  let single_data = (await Db_data).filter((user_id) => {
    user_id !==
      phone.$where({
        _id: mongoose.Types.ObjectId("634cef043f0a1e844a78b68e"),
      });
    console.log(user_id);
  });
}); */
app.post("/stk", access, async (req, res) => {
  let url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  let auth = "Bearer " + req.access_token;
  let { numValue, amtValue } = req.body;
  if (numValue._value == "" && amtValue._value == "") {
    res.send({ message: "Invalid credential" });
  } else {
    const phoneAndAmount = new phone({
      phoneNumbers: numValue._value,
      amount: amtValue._value,
    });
    console.log(phoneAndAmount.phoneNumbers);
    console.log(phoneAndAmount.amount);
    await phone.create(phoneAndAmount);
    request(
      {
        url: url,
        method: "POST",
        headers: {
          Authorization: auth,
        },
        json: {
          BusinessShortCode: 174379,
          Password:
            "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjIxMDEzMTM1NzI2",
          Timestamp: "20221013135726",
          TransactionType: "CustomerPayBillOnline",
          Amount: `${phoneAndAmount.amount}`,
          PartyA: `254${phoneAndAmount.phoneNumbers}`,
          PartyB: 174379,
          PhoneNumber: `254${phoneAndAmount.phoneNumbers}`,
          CallBackURL: "https://26ac-105-161-205-2.eu.ngrok.io/callback",
          AccountReference: "CompanyXLTD",
          TransactionDesc: "Payment of X",
        },
      },
      (error, response, body) => {
        if (error) {
          res.send({ message: "error" });
        } else {
          res.status(200).json(body);
          console.log(body);
        }
      }
    );
  }
});
app.post("/confirmation", (req, res) => {
  console.log("....................... confirmation .............");
  console.log(req.body);
  return res.status(200).res.send(req.body);
});

app.post("/validation", (req, res) => {
  console.log("....................... validation .............");
  let message = req.body;
  return res.status(200).res.send(message);
});
app.post("/stk_callback", (req, res) => {
  console.log(".......... STK Callback ..................");
  let data = JSON.stringify(req.body.Body.stkCallback);
  console.log(JSON.stringify(req.body.Body.stkCallback));
  return res.status(200).json({ message: data });
});
app.post("/timeout_url", (req, res) => {
  console.log("...............timeout response..............");
  console.log(req.body);
  return res.status(200).res.send(req.body);
});
app.post("/result_url", (req, res) => {
  console.log("...............results response..............");
  console.log(req.body);
  return res.status(200).res.send(req.body);
});

app.post("/callback", async (req, res) => {
  console.log(".......... STK Callback ..................");

  console.log(JSON.stringify(req.body.Body));
  let allData = [];
  let { Body } = req.body;
  if (Body === undefined) {
    setTimeout(async () => {
      console.log("done!!!");
    }, 10000);
  } else {
    allData.push(Body);
    await mpesa.create(Body);
  }

  /*  console.log(Body.stkCallback.MerchantRequestID);
  console.log(Body.stkCallback.CheckoutRequestID);
  console.log(Body.stkCallback.ResultCode);
  console.log(Body.stkCallback.ResultDesc);
  res.send([
    `{"MerchantRequestID":${data.MerchantRequestID}, "CheckoutRequestID":${data.MerchantRequestID},"ResultDesc":${data.ResultDesc},}}`,
  ]); */
  /* return res.status(200).send(data); */
});
app.get("/getRes", async (req, res) => {
  let allData = await mpesa.find();
  res.send(allData);
});
function access(req, res, next) {
  //access token
  let auth = new Buffer.from(
    "faPfM3YMXdAx8azyMlFdsEbVWQmVBkby:yVW7igEuKGHgdFuG"
  ).toString("base64");
  let url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  request(
    {
      //config
      url: url,
      headers: {
        Authorization: "Basic " + auth,
      },
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      } else {
        req.access_token = JSON.parse(body).access_token;
        next();
      }
    }
  );
}

//listening to the request for server
app.listen(port, (req, res) => {
  console.log(`listening on ${port}`);
});
