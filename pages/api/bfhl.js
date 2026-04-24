import { processData } from "../../lib/processor";
 

const USER_ID = "prashantbansal_22042005";
const EMAIL_ID = "pb4018@srmist.edu.in";
const COLLEGE_ROLL_NUMBER = "RA2311026030180";
 
export default function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
 
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
 
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
 
  const { data } = req.body || {};
 
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: "data must be an array" });
  }
 
  const result = processData(data);
 
  return res.status(200).json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    ...result,
  });
}