// Final Java connection code for nextjs-amazona database
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.MongoException;
import com.mongodb.ServerApi;
import com.mongodb.ServerApiVersion;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

public class NextJsAmazonaDBConnection {
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
                // Connect to nextjs-amazona database
                MongoDatabase database = mongoClient.getDatabase("nextjs-amazona");
                database.runCommand(new Document("ping", 1));
                System.out.println("Successfully connected to nextjs-amazona database!");
                
                // Test collections
                long productCount = database.getCollection("products").countDocuments();
                long userCount = database.getCollection("users").countDocuments();
                long orderCount = database.getCollection("orders").countDocuments();
                
                System.out.println("Database Statistics:");
                System.out.println("- Products: " + productCount);
                System.out.println("- Users: " + userCount);
                System.out.println("- Orders: " + orderCount);
                
            } catch (MongoException e) {
                System.err.println("Error connecting to MongoDB: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
