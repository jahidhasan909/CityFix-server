import express from "express";
import type { Express } from "express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";


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

        app.post('/api/usercollaction', async (req, res) => {
            const userdocs = req.body
            const result = await userCollaction.insertOne(userdocs)
            res.json(result)
        })

        app.post('/api/notice', async (req, res) => {
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





        app.patch('/api/usercollaction/makeblock', async (req, res) => {
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
        app.patch('/api/usercollaction/unblocked', async (req, res) => {
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


        app.patch('/api/usercollaction/makeadmin', async (req, res) => {
            const query: { email?: string } = {};
            if (req.query.email) {
                query.email = req.query.email as string
            }
            const updateDocument = {
                $set: {
                    role: 'admin'
                }
            }

            const result = await userCollaction.updateOne(query, updateDocument)

            res.json(result)

        })

        app.patch('/api/usercollaction/makeofficer', async (req, res) => {
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
        app.patch('/api/usercollaction/suspend', async (req, res) => {
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
        app.patch('/api/usercollaction/unsuspend', async (req, res) => {
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