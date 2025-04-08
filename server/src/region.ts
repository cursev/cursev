// change this to the region of the server
export const THIS_REGION: "na" | "eu" | "local" =
    process.env.NODE_ENV === "production" ? "na" : "local";
