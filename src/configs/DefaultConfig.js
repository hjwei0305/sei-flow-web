const {
    REACT_APP_HOST,
} = process.env;


export const gatewayHost = REACT_APP_HOST+"/api-gateway";

export const host = REACT_APP_HOST;
export const baseUrl ="/flow-service";
export const basicAuthor = "/auth-service";
export const uploadUrl = "";
export const flowDefUrl=REACT_APP_HOST+"/flow-web/design";

export const defaultPageSize = 15;
export const rowGutter = 20;
export const defaultPageSizeOptions = ['15', '50', '100'];




