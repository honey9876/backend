import  Express  from "express"
import core from "cors"
import cookieParser from "cookie-parser"

const app = Express()
app.use(core({
    origin: process.env.CORE_ORIGIN,
    Credentials: true
}))
app.use(Express.json({limit: "16kb"}))
app.use(Express.urlencoded({extended: true,limit:"16kb"}))
app.use(Express.static("public"))
app.use(cookieParser())

export {app}