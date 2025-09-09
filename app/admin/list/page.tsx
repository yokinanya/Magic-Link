import LinkList from "./link-list";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic"; // Force dynamic rendering

const MONGODB_DB = process.env.MONGODB_DB || "Muaca";
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || "Links";

// 安全的查询验证函数，防止NoSQL注入
function validateSearchQuery(parsedQuery: any): any {
  const allowedFields = ["path", "to", "creater"];
  const safeQuery: any = {};

  // 验证查询结构，只允许简单的对象
  if (
    !parsedQuery ||
    typeof parsedQuery !== "object" ||
    Array.isArray(parsedQuery)
  ) {
    return {};
  }

  for (const [key, value] of Object.entries(parsedQuery)) {
    // 只允许预定义的字段
    if (allowedFields.includes(key)) {
      if (typeof value === "string") {
        // 简单字符串匹配
        safeQuery[key] = { $regex: value, $options: "i" };
      } else if (value && typeof value === "object") {
        // 只允许特定的MongoDB操作符
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
          // 如果没有有效的操作符，使用默认的正则匹配
          safeQuery[key] = { $regex: String(value), $options: "i" };
        }
      } else {
        // 其他类型转换为字符串进行匹配
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
        // 使用安全的查询验证函数
        query = validateSearchQuery(parsedQuery);
      } catch (e) {
        console.error("Invalid search query format:", e);
        // 如果查询格式无效，使用空查询
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

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage =
    typeof resolvedSearchParams.page === "string"
      ? parseInt(resolvedSearchParams.page, 10)
      : 1;
  const searchQuery =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;

  const { links, pageCount, error } = await getLinks(currentPage, searchQuery);

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10 animate-fade-in-up">
        {error}
      </div>
    );
  }

  return (
    <div className="text-center mt-2 animate-fade-in-up">
      <div className="flex justify-center mb-2">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full shadow-lg button-hover">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-1 gradient-text-animate">
        List
      </h1>

      <p className="text-sm text-gray-600 mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        List of links
      </p>

      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <LinkList
          initialLinks={links as any}
          initialPage={currentPage}
          pageCount={pageCount}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
