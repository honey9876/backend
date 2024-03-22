class ApiError extends Error {
    constructor (
        statusCode,
        message="something went romg",
        errors = [],
        stack = ""

    ){ //over ride
      super(message)
      this.statusCode = statusCode
      this.data = null,
      this.message = message,
      this.success = false,
      this.errors = this.errors


      if(stack){
        this.stack = statck
      }else{
        Error.captureStackTrace(this, this.constructor)
      }


    }
}

export {ApiError}
