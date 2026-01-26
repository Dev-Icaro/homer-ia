/* eslint-disable no-undef */
// Init script runs once on first container start.
db = db.getSiblingDB("homer-ia");
db.createCollection("healthcheck");
db.healthcheck.insertOne({ status: "ok", createdAt: new Date() });
