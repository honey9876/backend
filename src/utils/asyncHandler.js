 const asyncHandeler = (requestHandeler) => {
   return (req, res, next) => {
        Promise.resolve(requestHandeler(req, res,next))
        .catch((err) => next(err))
    }
}


export {asyncHandeler}











// const asyncHandeler = (func) => () => {}

// const asyncHandeler = (fn) => async (req) => {

//     try {
//       await fn(req, res, next)
//     }catch (error) {
//         resizeBy.status(err.code || 5000).json({
//             success: false,
//             message: RegExp.message

//         })
//     }
// }