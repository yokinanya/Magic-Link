import CreateForm from "./components/CreateForm";
import LinkList from "./components/LinkList";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const MONGODB_DB = process.env.MONGODB_DB || "Muaca";
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || "Links";

// 安全的查询验证函数
function validateSearchQuery(parsedQuery: any): any {
  const allowedFields = ["path", "to", "creater"];
  const safeQuery: any = {};

  if (
    !parsedQuery ||
    typeof parsedQuery !== "object" ||
    Array.isArray(parsedQuery)
  ) {
    return {};
  }

  for (const [key, value] of Object.entries(parsedQuery)) {
    if (allowedFields.includes(key)) {
      if (typeof value === "string") {
        safeQuery[key] = { $regex: value, $options: "i" };
      } else if (value && typeof value === "object") {
        const allowedOperators = ["$regex", "$options", "$eq", "$ne"];
        const operatorValue: any = {};

        for (const [op, val] of Object.entries(value)) {
          if (allowedOperators.includes(op) && typeof val === "string") {
            operatorValue[op] = val;
          }
        }

        if (Object.keys(operatorValue).length > 0) {
          safeQuery[key] = operatorValue;
        } else {
          safeQuery[key] = { $regex: String(value), $options: "i" };
        }
      } else {
        safeQuery[key] = { $regex: String(value), $options: "i" };
      }
    }
  }

  return safeQuery;
}

async function getLinks(page: number, searchQuery: string | undefined) {
  try {
    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    const collection = db.collection(MONGODB_COLLECTION);

    let query = {};
    if (searchQuery) {
      try {
        const parsedQuery = JSON.parse(searchQuery);
        query = validateSearchQuery(parsedQuery);
      } catch (e) {
        console.error("Invalid search query format:", e);
        query = {};
      }
    }

    const pageSize = 20;
    const links = await collection
      .find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const totalLinks = await collection.countDocuments(query);
    const pageCount = Math.ceil(totalLinks / pageSize);

    const serializedLinks = links.map((link) => ({
      ...link,
      _id: link._id.toString(),
    }));

    return {
      links: serializedLinks,
      pageCount: pageCount,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      links: [],
      pageCount: 0,
      error: "Failed to load links. Please try again later.",
    };
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const searchQuery = resolvedSearchParams.search;
  
  const { links, pageCount, error } = await getLinks(page, searchQuery);
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-150 h-full">
      <div className="container mx-auto px-4 py-4 h-full">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left Sidebar - Create Link */}
          <aside className="w-full lg:w-1/4 min-w-[300px] flex-shrink-0 overflow-auto">
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  New Link
                </h2>
                <CreateForm />
             </div>
          </aside>

          {/* Right Content - Link List */}
          <main className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col overflow-hidden">
             <div className="flex flex-col h-full">
               <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2 flex-shrink-0">
                  <span className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-600 dark:text-purple-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Manage Links
               </h2>
               <div className="flex-1 overflow-hidden">
                 <LinkList 
                    initialLinks={links} 
                    initialPage={page} 
                    pageCount={pageCount} 
                    searchQuery={searchQuery}
                  />
               </div>
               {error && <div className="text-red-500 text-center mt-4">{error}</div>}
             </div>
          </main>
        </div>
      </div>
    </div>
  );
}
