import getUser from "./getUser";

const getProvider =async()=>{
    try{
        const user = await getUser();
        if(!user) console.error("Cannot get User");
        else{
        const provider = user?.app_metadata.provider
        if(!provider) console.error("Cannot get Provider");
        else{
        console.log("Provider:"+provider)
        return provider}}
        }
        catch(e){
            console.error(e);
        }
    }
    export default getProvider;