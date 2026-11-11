import mongoose from 'mongoose'
import logger from '../util/logger'

const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`
        )
        logger.info('INFO :: Database connected!')
    } catch (error) {
        logger.error('INFO :: Database connection failed!' + error)
    }
}

export default connectDB
