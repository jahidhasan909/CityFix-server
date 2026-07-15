
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
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
app.use(express.json())

const uri = process.env.MONGODB_URI

const client = new MongoClient(uri!, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});








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






async function run() {
    try {
        // await client.connect();
        // await client.db("admin").command({ ping: 1 });

        const database = client.db(process.env.MONGODB_DB)
        const userCollaction = database.collection('usercollaction')
        const users = database.collection('user')
        const reportsCollaction = database.collection('reportscollaction')
        const notice = database.collection('notice')
        const campaing = database.collection('campaing')
        const publicComments = database.collection('publiccomments')
        const funding = database.collection('funding')
        const like=database.collection('like')
        const unlike=database.collection('unlike')



    


      

app.post('/api/like', async (req, res) => {
    const { reportId } = req.body;
    if (!reportId) return res.status(400).json({ error: "reportId is required" });
    
   
    const result = await like.insertOne({ reportId, createdAt: new Date() });
    res.json(result);
});


app.get('/api/like', async (req, res) => {
    const { reportId } = req.query;
    if (!reportId) return res.status(400).json({ error: "reportId is required" });
    
    
    const count = await like.countDocuments({ reportId });
    res.json({ count });
});


app.post('/api/unlike', async (req, res) => {
    const { reportId } = req.body;
    if (!reportId) return res.status(400).json({ error: "reportId is required" });
    
    const result = await unlike.insertOne({ reportId, createdAt: new Date() });
    res.json(result);
});


app.get('/api/unlike', async (req, res) => {
    const { reportId } = req.query;
    if (!reportId) return res.status(400).json({ error: "reportId is required" });
    
    const count = await unlike.countDocuments({ reportId });
    res.json({ count });
});





        app.post('/api/usercollaction', async (req, res) => {
            const userdocs = req.body
            const result = await userCollaction.insertOne(userdocs)
            res.json(result)
        })
        app.get('/api/usercollaction', async (req, res) => {
            const result = await userCollaction.find().toArray()
            res.json(result)
        })

        app.post('/api/notice',verifyToken, async (req, res) => {
            const newnotice = req.body
            const result = await notice.insertOne(newnotice)
            res.json(result)
        })
        app.post('/api/campaing', async (req, res) => {
            const newcampaing = req.body
            const result = await campaing.insertOne(newcampaing)
            res.json(result)
        })
        app.get('/api/campaing', async (req, res) => {
            const result = await campaing.find().toArray()
            res.json(result)
        })
        app.get('/api/campaing/:id', async (req, res) => {
            const { id } = req.params;
            const fillter = {
                _id: new ObjectId(id)
            }
            const result = await campaing.find(fillter).toArray()
            res.json(result)
        })
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
                const result = await campaing.updateOne(query, updateDocument);
                res.json(result);
            } catch (error) {
                console.error("Database update error:", error);
                res.status(500).json({ error: "Failed to update attendance" });
            }
        });






        app.post('/api/funding', async (req, res) => {
            const fundingdetails = req.body
            const result = await funding.insertOne(fundingdetails)
            res.json(result)
        })
        app.get('/api/funding', async (req, res) => {
            const cursor = await funding.find().toArray()
            res.json(cursor)
        })
        app.get('/api/reports', async (req, res) => {
            const cursor = await reportsCollaction.find().toArray()
            res.json(cursor)
        })
        app.get('/api/pegination/funding', async (req, res) => {
            const { page = 1, limit = 10 } = req.query
            const skip = (Number(page) - 1) * Number(limit)


            const result = await funding.find().skip(skip).limit(Number(limit)).toArray()
            const totalData = await funding.countDocuments();
            const totalPage = Math.ceil(totalData / Number(limit));
            res.json({ data: result, page: Number(page), totalPage })
        })




        app.patch('/api/report/edit/:id', async (req, res) => {
            const id = req.params.id

            const updateData = req.body


            const fillter = { _id: new ObjectId(id) }
            const updateDocument = {
                $set: { ...updateData }
            }

            const result = await reportsCollaction.updateOne(fillter, updateDocument)
            res.json(result)

        })

        app.get('/api/reports/:id', async (req, res) => {
            const id = req.params.id




            const fillter = { _id: new ObjectId(id) }


            const result = await reportsCollaction.findOne(fillter)
            res.json(result)

        })






        app.delete('/api/own/reports/:id', async (req, res) => {
            const id = req.params.id
            const query = {
                _id: new ObjectId(id)
            }

            const result = await reportsCollaction.deleteOne(query)
            res.json(result)

        })
        app.delete('/api/campaing/:id', async (req, res) => {
            const id = req.params.id
            const query = {
                _id: new ObjectId(id)
            }

            const result = await campaing.deleteOne(query)
            res.json(result)

        })
        app.delete('/api/notice/:id', async (req, res) => {
            const id = req.params.id
            const query = {
                _id: new ObjectId(id)
            }

            const result = await notice.deleteOne(query)
            res.json(result)

        })





        app.patch('/api/usercollaction/makeblock',verifyToken, async (req, res) => {
            const query: { email?: string } = {};
            if (req.query.email) {
                query.email = req.query.email as string
            }
            const updateDocument = {
                $set: {
                    status: 'blocked'
                }
            }

            const result = await userCollaction.updateOne(query, updateDocument)

            res.json(result)

        })
        app.patch('/api/usercollaction/unblocked',verifyToken, async (req, res) => {
            const query: { email?: string } = {};
            if (req.query.email) {
                query.email = req.query.email as string
            }
            const updateDocument = {
                $set: {
                    status: 'active'
                }
            }

            const result = await userCollaction.updateOne(query, updateDocument)

            res.json(result)

        })
        app.patch('/api/reports/inprogress/:id', async (req, res) => {
            const id = req.params.id

            const fillter = { _id: new ObjectId(id) }
            const updateDocument = {
                $set: {
                    status: 'inprogress'
                }
            }

            const result = await reportsCollaction.updateOne(fillter, updateDocument)

            res.json(result)

        })


        app.patch('/api/reports/cancelled/:id', async (req, res) => {
            const id = req.params.id

            const fillter = { _id: new ObjectId(id) }
            const updateDocument = {
                $set: {
                    status: 'cancelled'
                }
            }

            const result = await reportsCollaction.updateOne(fillter, updateDocument)

            res.json(result)

        })


        app.patch('/api/reports/resolved/:id', async (req, res) => {
            const id = req.params.id

            const fillter = { _id: new ObjectId(id) }
            const updateDocument = {
                $set: {
                    status: 'resolved'
                }
            }

            const result = await reportsCollaction.updateOne(fillter, updateDocument)

            res.json(result)

        })

        app.patch('/api/usercollaction/makeofficer',verifyToken, async (req, res) => {
            const query: { email?: string } = {};
            if (req.query.email) {
                query.email = req.query.email as string
            }
            const updateDocument = {
                $set: {
                    role: 'officer'
                }
            }

            const result = await userCollaction.updateOne(query, updateDocument)

            res.json(result)

        })
        app.patch('/api/usercollaction/suspend',verifyToken, async (req, res) => {
            const query: { email?: string } = {};
            if (req.query.email) {
                query.email = req.query.email as string
            }
            const updateDocument = {
                $set: {
                    status: 'suspended'
                }
            }

            const result = await userCollaction.updateOne(query, updateDocument)

            res.json(result)

        })
        app.patch('/api/usercollaction/unsuspend',verifyToken, async (req, res) => {
            const query: { email?: string } = {};
            if (req.query.email) {
                query.email = req.query.email as string
            }
            const updateDocument = {
                $set: {
                    status: 'active'
                }
            }

            const result = await userCollaction.updateOne(query, updateDocument)

            res.json(result)

        })




















        app.get('/api/notice', async (req, res) => {
            const result = await notice.find().toArray()
            res.json(result)
        })
        app.get('/api/publiccomments', async (req, res) => {
            const newcommemts = req.body
            const result = await publicComments.find(newcommemts).toArray()
            res.json(result)
        })
        app.get('/api/own/publiccomments', async (req, res) => {
            try {
                const { reportId } = req.query;

                let query = {};
                if (reportId) {
                    query = { reportId: reportId };
                }

                const result = await publicComments.find(query).toArray();
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch comments" });
            }
        });
        app.post('/api/publiccomments', async (req, res) => {
            const newcommemts = req.body
            const result = await publicComments.insertOne(newcommemts)
            res.json(result)
        })

        app.get('/api/own/usercollaction', async (req, res) => {
            const query: { email?: string } = {};
            if (req.query.email) {
                query.email = req.query.email as string;
            }
            const corsor = await userCollaction.findOne(query)
            res.json(corsor)
        })
        app.patch('/api/own/usercollaction', async (req, res) => {
            const query: { email?: string } = {};
            const updateData = req.body
            if (req.query.email) {
                query.email = req.query.email as string;
            }
            const updateDocument = {
                $set: { ...updateData }
            }

            const corsor = await userCollaction.updateOne(query, updateDocument)
            const result = await users.updateOne({ email: req.query.email as string }, {
                $set: {
                    name: updateData.name,
                    image: updateData.image
                }
            })
            res.json({ corsor, result })
        })



        app.get('/api/pegination/users', async (req, res) => {
            const { page = 1, limit = 10 } = req.query
            const skip = (Number(page) - 1) * Number(limit)


            const result = await userCollaction.find().skip(skip).limit(Number(limit)).toArray()
            const totalData = await userCollaction.countDocuments();
            const totalPage = Math.ceil(totalData / Number(limit));
            res.json({ data: result, page: Number(page), totalPage })
        })
        app.get('/api/pegination/campaing', async (req, res) => {
            const { page = 1, limit = 10 } = req.query
            const skip = (Number(page) - 1) * Number(limit)


            const result = await campaing.find().skip(skip).limit(Number(limit)).toArray()
            const totalData = await campaing.countDocuments();
            const totalPage = Math.ceil(totalData / Number(limit));
            res.json({ data: result, page: Number(page), totalPage })
        })



        app.post('/api/reports', async (req, res) => {
            const requestdocs = req.body
            const result = await reportsCollaction.insertOne(requestdocs)
            res.json(result)
        })
        app.get('/api/public/reports', async (req, res) => {
            const requestdocs = req.body
            const result = await reportsCollaction.find(requestdocs).toArray()
            res.json(result)
        })

        app.get('/api/owncitizen/pegination/reports', async (req, res) => {
            const { page = 1, limit = 10 } = req.query
            const skip = (Number(page) - 1) * Number(limit)
            const query: { citizenEmail?: string } = {};

            if (req.query.citizenEmail) {
                query.citizenEmail = req.query.citizenEmail as string
            }
            const result = await reportsCollaction.find(query).skip(skip).limit(Number(limit)).toArray()
            const totalData = await reportsCollaction.countDocuments(query);
            const totalPage = Math.ceil(totalData / Number(limit));
            res.json({ data: result, page: Number(page), totalPage })
        })
        app.get('/api/adminofficer/pegination/reports', async (req, res) => {
            const { page = 1, limit = 10 } = req.query
            const skip = (Number(page) - 1) * Number(limit)


            const result = await reportsCollaction.find().skip(skip).limit(Number(limit)).toArray()
            const totalData = await reportsCollaction.countDocuments();
            const totalPage = Math.ceil(totalData / Number(limit));
            res.json({ data: result, page: Number(page), totalPage })
        })















        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on PORT ${port}`)
})