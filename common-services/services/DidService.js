function toHex(input) {
    input = Math.abs(input.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
    let hash = "",
        alphabet = "0123456789abcdef",
        alphabetLength = alphabet.length;

    do {
        hash = alphabet[input % alphabetLength] + hash;
        input = parseInt(input / alphabetLength, 10);
    } while (input);

    return hash;

}

class DidService {

    constructor() {
        this.environmentData = null;
    }

    static getDidData(didString) {
        const splitDid = didString.split(":");
        return {
            didType: `${splitDid[1]}:${splitDid[2]}`,
            publicName: splitDid[4],
            domain: splitDid[3]
        };
    }

    getUserDetails(callback) {
        const fetch = require("../utils/fetch");
        fetch('/api-standard/user-details')
            .then((response) => response.json())
            .then((userDetails) => {
                callback(null, userDetails);
            })
            .catch((err) => {
                console.log(`Failed to load user-details`, err);
                callback(err);
            });
    }

    async getWalletDomain() {
        const opendsu = require("opendsu");
        const config = opendsu.loadAPI("config");

        let domain = await $$.promisify(config.getEnv)("domain");
        if (!domain) {
            throw new Error("No domain was set up in the environment configuration file.")
        }
        return domain;
    }

    async getDID() {
        return new Promise(async (resolve, reject) => {
            this.getEnvironmentData().then(data => {
                resolve(data.did);
            }).catch(err => {
                reject(err);
            });
        });
    }

    async getEnvironmentData() {
        return new Promise(async (resolve, reject) => {
            if (this.environmentData) {
                return resolve(this.environmentData);
            }

            const opendsu = require("opendsu");
            const scAPI = opendsu.loadApi("sc");

            const mainDSU = await $$.promisify(scAPI.getMainDSU)();
            const envData = JSON.parse(await $$.promisify(mainDSU.readFile)("environment.json"));

            if (typeof window !== "undefined") {
                return this.getUserDetails(async (err, userDetails) => {
                    if (err) {
                        return reject(err);
                    }

                    const domain = await this.getWalletDomain();
                    const {email, company, password, username} = userDetails;
                    const randomData = `${email}${company}${password}`;
                    const hashCode = toHex(randomData);

                    const did = `did:ssi:name:${domain}:${username}/${hashCode}`;
                    this.environmentData = {
                        ...envData,
                        did: did
                    };

                    resolve(this.environmentData);
                });
            }

            if (!envData.hasOwnProperty("did")) {
                return reject("No did set in environment.js");
            }

            this.environmentData = envData;
            resolve(this.environmentData);
        });
    }
}


let instance = null;
const getDidServiceInstance = () => {
    if (instance === null) {
        instance = new DidService();
    }
    return instance;
};

module.exports = {
    getDidServiceInstance,
    getDidData: DidService.getDidData
};
