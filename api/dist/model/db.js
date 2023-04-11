const uri = 'mongodb://localhost:27017/your-db-name';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB: ${uri}`);
});
mongoose.connection.on('error', (err) => {
    console.error(`Error connecting to MongoDB: ${err}`);
});
//# sourceMappingURL=db.js.map