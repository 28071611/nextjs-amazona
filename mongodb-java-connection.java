// Updated Java code for your database
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.MongoException;
import com.mongodb.ServerApi;
import com.mongodb.ServerApiVersion;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

public class MongoClientConnectionExample {
    public static void main(String[] args) {
        String connectionString = "mongodb+srv://harishpblr2007_db_user:<db_password>@cluster0.yaga33w.mongodb.net/?appName=Cluster0";
        ServerApi serverApi = ServerApi.builder()
                .version(ServerApiVersion.V1)
                .build();
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(connectionString))
                .serverApi(serverApi)
                .build();
        
        try (MongoClient mongoClient = MongoClients.create(settings)) {
            try {
                // Connect to your application database
                MongoDatabase database = mongoClient.getDatabase("nextjs-amazona");
                database.runCommand(new Document("ping", 1));
                System.out.println("Successfully connected to nextjs-amazona database!");
                
                // Test collection access
                long collectionCount = database.getCollection("products").countDocuments();
                System.out.println("Products collection count: " + collectionCount);
                
            } catch (MongoException e) {
                e.printStackTrace();
            }
        }
    }
}
