const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const extend = (obj, src) => {
  Object.keys(src).forEach(key => {
    obj[key] = src[key];
  });
  return obj;
};

exports.getDealers = functions
  .region("asia-east2")
  .https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const dealers = [];
    try {
      const user = (
        await db
          .collection("user")
          .doc(uid)
          .get()
      ).data();
      if (user.post === "am") {
        const promises = user.mo.map(item => {
          return db
            .collection("dealers")
            .where("mo", "==", item)
            .get();
        });
        const resp = await Promise.all(promises);
        resp.forEach(querySnap => {
          querySnap.forEach(doc => {
            dealers.push(extend(doc.data(), { id: doc.id }));
          });
        });
      } else if (user.post === "mo") {
        const querySnapShot = await db
          .collection("dealers")
          .where("mo", "==", uid)
          .get();
        querySnapShot.forEach(doc => {
          dealers.push(extend(doc.data(), { id: doc.id }));
        });
      }
      return dealers;
    } catch (error) {
      console.error(error);
      return "error.message";
    }
  });

exports.addToStock = functions
  .region("asia-east2")
  .firestore.document("challans/{challanId}")
  .onCreate(doc => {
    const batch = db.batch();
    const data = doc.data();
    data.challan.forEach(product => {
      const variants = [];
      const ref = db.collection("products").doc(product.product_id);
      product.items_added.forEach(item => {
        item.variant.stock += item.units;
        variants.push(item.variant);
      });
      batch.update(ref, { variants });
    });
    batch
      .commit()
      .then(() => {
        console.log(`stock updated for challan No ${data.challan_no}.`);
        return "success";
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  });

exports.removeFromStock = functions
  .region("asia-east2")
  .firestore.document("challans/{challanId}")
  .onDelete(async doc => {
    const batch = db.batch();
    const data = doc.data();
    const promises = [];

    data.challan.forEach(product => {
      promises.push(
        db
          .collection("products")
          .doc(product.product_id)
          .get()
      );
    });
    const responses = (await Promise.all(promises)).map(doc => {
      return doc.data();
    });

    data.challan.forEach((product, index) => {
      const currentProduct = responses[index];
      const variants = [];
      const ref = db.collection("products").doc(product.product_id);
      product.items_added.forEach(item => {
        const currentUnits = currentProduct.variants[item.index].stock;
        item.variant.stock = currentUnits - item.units;
        variants.push(item.variant);
      });
      batch.update(ref, { variants });
    });
    batch
      .commit()
      .then(() => {
        console.log(`stock deleted for challan No ${data.challan_no}.`);
        return "success";
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  });
exports.addInvoice = functions
  .region("asia-east2")
  .firestore.document("invoices/{invoiceId}")
  .onWrite(async change => {
    const previousDoc = change.before.exists ? change.before.data() : null;
    const afterDoc = change.after.exists ? change.after.data() : null;
    const batch = db.batch();
    const promises = [];
    let responses;
    try {
      if (previousDoc && afterDoc) {
        if (!previousDoc.confirmed && afterDoc.confirmed) {
          afterDoc.items.forEach(item => {
            if (!promises.includes(item.product_obj.id)) {
              promises.push(item.product_obj.id);
            }
          });
          const promisesArr = promises.map(item => {
            return db
              .collection("products")
              .doc(item)
              .get();
          });
          responses = (await Promise.all(promisesArr)).map(doc => {
            return {
              id: doc.id,
              data: doc.data()
            };
          });
          afterDoc.items.forEach(item => {
            const product = responses.filter(product => {
              return product.id === item.product_obj.id;
            })[0];
            product.data.variants[item.index].stock -= item.units;
          });
          responses.forEach(resp => {
            const ref = db.collection("products").doc(resp.id);
            batch.update(ref, {
              variants: resp.data.variants
            });
          });
          await batch.commit();
        }
      } else if (previousDoc && !afterDoc) {
        previousDoc.items.forEach(item => {
          if (!promises.includes(item.product_obj.id)) {
            promises.push(item.product_obj.id);
          }
        });
        const promisesArr = promises.map(item => {
          return db
            .collection("products")
            .doc(item)
            .get();
        });
        responses = (await Promise.all(promisesArr)).map(doc => {
          return {
            id: doc.id,
            data: doc.data()
          };
        });
        previousDoc.items.forEach(item => {
          const product = responses.filter(product => {
            return product.id === item.product_obj.id;
          })[0];
          product.data.variants[item.index].stock += item.units;
        });
        responses.forEach(resp => {
          const ref = db.collection("products").doc(resp.id);
          batch.update(ref, {
            variants: resp.data.variants
          });
        });
        await batch.commit();
      }
      return "success";
    } catch (error) {
      console.log(error);
      return error;
    }
  });
