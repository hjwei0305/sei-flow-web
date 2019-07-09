const {
    REACT_APP_HOST,
} = process.env;


export const host = REACT_APP_HOST || '';
export const gatewayHost = host+"/api-gateway";

export const baseUrl ="/flow-service";
export const basicAuthor = "/auth-service";
export const uploadUrl = "";
export const flowDefUrl=host+"/flow-web/design";

export const defaultPageSize = 15;
export const rowGutter = 20;
export const defaultPageSizeOptions = ['15', '50', '100'];




