import { MongoClient, ServerApiVersion, ObjectId, Db } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose-cjs";
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";

dotenv.config();

const app: Express = express();
const port: number = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not defined in env variables!");
}

const client = new MongoClient(uri!, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let cachedDb: Db | null = null;

async function getDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'cityfix-db');
  cachedDb = db;
  return db;
}


async function getCollections() {
  const db = await getDatabase();
  return {
    userCollaction: db.collection('usercollaction'),
    users: db.collection('user'),
    reportsCollaction: db.collection('reportscollaction'),
    notice: db.collection('notice'),
    campaing: db.collection('campaing'),
    publicComments: db.collection('publiccomments'),
    funding: db.collection('funding'),
    like: db.collection('like'),
    unlike: db.collection('unlike'),
  };
}

const JWKS = createRemoteJWKSet(
  new URL(process.env.JWKSUSER_URI as string)
);

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ msg: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ msg: "Unauthorized" });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ msg: "Unauthorized" });
  }
};



app.get('/', (req, res) => {
    res.send('Hello CityFix Server is Running!')
});

app.post('/api/like', async (req, res) => {
    try {
        const { reportId } = req.body;
        if (!reportId) return res.status(400).json({ error: "reportId is required" });
        const collections = await getCollections();
        const result = await collections.like.insertOne({ reportId, createdAt: new Date() });
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/like', async (req, res) => {
    try {
        const { reportId } = req.query;
        if (!reportId) return res.status(400).json({ error: "reportId is required" });
        const collections = await getCollections();
        const count = await collections.like.countDocuments({ reportId: reportId as string });
        res.json({ count });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/unlike', async (req, res) => {
    try {
        const { reportId } = req.body;
        if (!reportId) return res.status(400).json({ error: "reportId is required" });
        const collections = await getCollections();
        const result = await collections.unlike.insertOne({ reportId, createdAt: new Date() });
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/unlike', async (req, res) => {
    try {
        const { reportId } = req.query;
        if (!reportId) return res.status(400).json({ error: "reportId is required" });
        const collections = await getCollections();
        const count = await collections.unlike.countDocuments({ reportId: reportId as string });
        res.json({ count });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/usercollaction', async (req, res) => {
    try {
        const userdocs = req.body;
        const collections = await getCollections();
        const result = await collections.userCollaction.insertOne(userdocs);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/usercollaction', async (req, res) => {
    try {
        const collections = await getCollections();
        const result = await collections.userCollaction.find().toArray();
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notice', verifyToken, async (req, res) => {
    try {
        const newnotice = req.body;
        const collections = await getCollections();
        const result = await collections.notice.insertOne(newnotice);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/campaing', async (req, res) => {
    try {
        const newcampaing = req.body;
        const collections = await getCollections();
        const result = await collections.campaing.insertOne(newcampaing);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/campaing', async (req, res) => {
    try {
        const collections = await getCollections();
        const result = await collections.campaing.find().toArray();
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/campaing/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filter = { _id: new ObjectId(id) };
        const collections = await getCollections();
        const result = await collections.campaing.find(filter).toArray();
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/campaing/:id', async (req, res) => {
    const { id } = req.params;
    const attendeeData = req.body;
    const query = { _id: new ObjectId(id) };
    const updateDocument = {
        $push: {
            attendees: {
                name: attendeeData.name,
                email: attendeeData.email,
                attendedAt: new Date()
            }
        }
    } as any;

    try {
        const collections = await getCollections();
        const result = await collections.campaing.updateOne(query, updateDocument);
        res.json(result);
    } catch (error) {
        console.error("Database update error:", error);
        res.status(500).json({ error: "Failed to update attendance" });
    }
});

app.post('/api/funding', async (req, res) => {
    try {
        const fundingdetails = req.body;
        const collections = await getCollections();
        const result = await collections.funding.insertOne(fundingdetails);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/funding', async (req, res) => {
    try {
        const collections = await getCollections();
        const cursor = await collections.funding.find().toArray();
        res.json(cursor);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reports', async (req, res) => {
    try {
        const collections = await getCollections();
        const cursor = await collections.reportsCollaction.find().toArray();
        res.json(cursor);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pegination/funding', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const collections = await getCollections();
        const result = await collections.funding.find().skip(skip).limit(Number(limit)).toArray();
        const totalData = await collections.funding.countDocuments();
        const totalPage = Math.ceil(totalData / Number(limit));
        res.json({ data: result, page: Number(page), totalPage });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/report/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDocument = { $set: { ...updateData } };
        const collections = await getCollections();
        const result = await collections.reportsCollaction.updateOne(filter, updateDocument);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reports/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const collections = await getCollections();
        const result = await collections.reportsCollaction.findOne(filter);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/own/reports/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const collections = await getCollections();
        const result = await collections.reportsCollaction.deleteOne(query);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/campaing/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const collections = await getCollections();
        const result = await collections.campaing.deleteOne(query);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/notice/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const collections = await getCollections();
        const result = await collections.notice.deleteOne(query);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/usercollaction/makeblock', verifyToken, async (req, res) => {
    try {
        const query: { email?: string } = {};
        if (req.query.email) {
            query.email = req.query.email as string;
        }
        const updateDocument = { $set: { status: 'blocked' } };
        const collections = await getCollections();
        const result = await collections.userCollaction.updateOne(query, updateDocument);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/usercollaction/unblocked', verifyToken, async (req, res) => {
    try {
        const query: { email?: string } = {};
        if (req.query.email) {
            query.email = req.query.email as string;
        }
        const updateDocument = { $set: { status: 'active' } };
        const collections = await getCollections();
        const result = await collections.userCollaction.updateOne(query, updateDocument);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/reports/inprogress/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDocument = { $set: { status: 'inprogress' } };
        const collections = await getCollections();
        const result = await collections.reportsCollaction.updateOne(filter, updateDocument);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/reports/cancelled/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDocument = { $set: { status: 'cancelled' } };
        const collections = await getCollections();
        const result = await collections.reportsCollaction.updateOne(filter, updateDocument);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/reports/resolved/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDocument = { $set: { status: 'resolved' } };
        const collections = await getCollections();
        const result = await collections.reportsCollaction.updateOne(filter, updateDocument);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/usercollaction/makeofficer', verifyToken, async (req, res) => {
    try {
        const query: { email?: string } = {};
        if (req.query.email) {
            query.email = req.query.email as string;
        }
        const updateDocument = { $set: { role: 'officer' } };
        const collections = await getCollections();
        const result = await collections.userCollaction.updateOne(query, updateDocument);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/usercollaction/suspend', verifyToken, async (req, res) => {
    try {
        const query: { email?: string } = {};
        if (req.query.email) {
            query.email = req.query.email as string;
        }
        const updateDocument = { $set: { status: 'suspended' } };
        const collections = await getCollections();
        const result = await collections.userCollaction.updateOne(query, updateDocument);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/usercollaction/unsuspend', verifyToken, async (req, res) => {
    try {
        const query: { email?: string } = {};
        if (req.query.email) {
            query.email = req.query.email as string;
        }
        const updateDocument = { $set: { status: 'active' } };
        const collections = await getCollections();
        const result = await collections.userCollaction.updateOne(query, updateDocument);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/notice', async (req, res) => {
    try {
        const collections = await getCollections();
        const result = await collections.notice.find().toArray();
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/publiccomments', async (req, res) => {
    try {
        const newcommemts = req.body;
        const collections = await getCollections();
        const result = await collections.publicComments.find(newcommemts).toArray();
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/own/publiccomments', async (req, res) => {
    try {
        const { reportId } = req.query;
        let query = {};
        if (reportId) {
            query = { reportId: reportId };
        }
        const collections = await getCollections();
        const result = await collections.publicComments.find(query).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

app.post('/api/publiccomments', async (req, res) => {
    try {
        const newcommemts = req.body;
        const collections = await getCollections();
        const result = await collections.publicComments.insertOne(newcommemts);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/own/usercollaction', async (req, res) => {
    try {
        const query: { email?: string } = {};
        if (req.query.email) {
            query.email = req.query.email as string;
        }
        const collections = await getCollections();
        const cursor = await collections.userCollaction.findOne(query);
        res.json(cursor);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/own/usercollaction', async (req, res) => {
    try {
        const query: { email?: string } = {};
        const updateData = req.body;
        if (req.query.email) {
            query.email = req.query.email as string;
        }
        const updateDocument = { $set: { ...updateData } };
        const collections = await getCollections();
        const cursor = await collections.userCollaction.updateOne(query, updateDocument);
        const result = await collections.users.updateOne({ email: req.query.email as string }, {
            $set: {
                name: updateData.name,
                image: updateData.image
            }
        });
        res.json({ cursor, result });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pegination/users', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const collections = await getCollections();
        const result = await collections.userCollaction.find().skip(skip).limit(Number(limit)).toArray();
        const totalData = await collections.userCollaction.countDocuments();
        const totalPage = Math.ceil(totalData / Number(limit));
        res.json({ data: result, page: Number(page), totalPage });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pegination/campaing', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const collections = await getCollections();
        const result = await collections.campaing.find().skip(skip).limit(Number(limit)).toArray();
        const totalData = await collections.campaing.countDocuments();
        const totalPage = Math.ceil(totalData / Number(limit));
        res.json({ data: result, page: Number(page), totalPage });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reports', async (req, res) => {
    try {
        const requestdocs = req.body;
        const collections = await getCollections();
        const result = await collections.reportsCollaction.insertOne(requestdocs);
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/public/reports', async (req, res) => {
    try {
        const requestdocs = req.body;
        const collections = await getCollections();
        const result = await collections.reportsCollaction.find(requestdocs).toArray();
        res.json(result);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/owncitizen/pegination/reports', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query: { citizenEmail?: string } = {};

        if (req.query.citizenEmail) {
            query.citizenEmail = req.query.citizenEmail as string;
        }
        const collections = await getCollections();
        const result = await collections.reportsCollaction.find(query).skip(skip).limit(Number(limit)).toArray();
        const totalData = await collections.reportsCollaction.countDocuments(query);
        const totalPage = Math.ceil(totalData / Number(limit));
        res.json({ data: result, page: Number(page), totalPage });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/adminofficer/pegination/reports', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const collections = await getCollections();
        const result = await collections.reportsCollaction.find().skip(skip).limit(Number(limit)).toArray();
        const totalData = await collections.reportsCollaction.countDocuments();
        const totalPage = Math.ceil(totalData / Number(limit));
        res.json({ data: result, page: Number(page), totalPage });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});


if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Example app listening on PORT ${port}`);
    });
}


export default app;