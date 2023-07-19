const openDSU = require('opendsu');
const credentials = openDSU.loadApi('credentials');
const validationStrategies = credentials.validationStrategies;
const validationStrategiesTypes = validationStrategies.VALIDATION_STRATEGIES;

class JWTService {

    async createVerifiableCredential(issuer, subject, options) {
        return await credentials.createJWTVerifiableCredentialAsync(issuer, subject, options);
    }

    async verifyCredential(encodedJWTVerifiableCredential, rootsOfTrust = []) {
        const jwtVcInstance = await credentials.loadJWTVerifiableCredentialAsync(encodedJWTVerifiableCredential);
        const verifyCredentialStatus = await jwtVcInstance.verifyJWTAsync(rootsOfTrust);

        console.log(jwtVcInstance, verifyCredentialStatus);
        return {jwtVcInstance, verifyCredentialStatus};
    }

    async createVerifiablePresentation(issuer, options) {
        return await credentials.createJWTVerifiablePresentationAsync(issuer, options);
    }

    async verifyPresentation(encodedJWTVerifiablePresentation, rootsOfTrust = []) {
        const loadedPresentation = await credentials.loadJWTVerifiablePresentationAsync(encodedJWTVerifiablePresentation);
        const verifyPresentationStatus = await loadedPresentation.verifyJWTAsync(rootsOfTrust);

        console.log(verifyPresentationStatus);
        return verifyPresentationStatus;
    }

    async createVCForIFC(siteDid, tpDid, claims) {
        const {subjectClaims} = claims;
        const jwtVcInstance = await this.createVerifiableCredential(tpDid, siteDid);

        if (subjectClaims) {
            await jwtVcInstance.embedSubjectClaimAsync("https://clinical-site-wallet.dev/ifcVC", "ifcVC", subjectClaims);
        }

        const encodedJWTVc = await jwtVcInstance.getEncodedJWTAsync();
        return encodedJWTVc;
    }

    async createVerifiableCredentialForAnonymousPatient(clinicalSiteDID, trialParticipantDID, claimsToEmbed) {
        const {subjectClaims, publicClaims} = claimsToEmbed;
        const jwtVcInstance = await this.createVerifiableCredential(clinicalSiteDID, trialParticipantDID);

        if (subjectClaims) {
            // TODO: Create a minimal JSON-LD schema and make it available via API-hub middleware + update URI
            await jwtVcInstance.embedSubjectClaimAsync("https://clinical-site-wallet.dev/AnonymousDID", "AnonymousDID", subjectClaims);
        }

        if (publicClaims) {
            for (const claimName of Object.keys(publicClaims)) {
                await jwtVcInstance.embedClaimAsync(claimName, publicClaims[claimName]);
            }
        }

        const encodedJWTVc = await jwtVcInstance.getEncodedJWTAsync();

        console.log('encoded jwt vc of anonymous trial participant', encodedJWTVc);
        return encodedJWTVc;
    }

    async createVerifiablePresentationWithAnonymousPatient(clinicalSiteDID, tpEncodedJWTVc) {
        const jwtVpInstance = await this.createVerifiablePresentation(clinicalSiteDID, {credentialsToPresent: [tpEncodedJWTVc]});
        const encodedJWTVp = await jwtVpInstance.getEncodedJWTAsync();

        console.log('encoded jwt vp for anonymous trial participant', encodedJWTVp);
        return encodedJWTVp;
    }

    async validatePresentationOfAnonymousPatient(tpEncodedJWTVp, environmentData) {
        const jwtVpVerifyResult = await this.verifyPresentation(tpEncodedJWTVp, environmentData.rootsOfTrust);
        const tpDecodedVerifiableCredential = jwtVpVerifyResult.vp.verifiableCredential[0];

        const validationResult = await validationStrategies.validatePresentationAsync(
            [validationStrategiesTypes.DEFAULT, validationStrategiesTypes.ROOTS_OF_TRUST],
            environmentData,
            jwtVpVerifyResult);
        console.log('trial participant details from presentation: ', jwtVpVerifyResult, tpDecodedVerifiableCredential);
        console.log('validation result: ', validationResult);

        return {
            jwtVpVerifyResult,
            validationResult,
            tpDecodedVerifiableCredential
        };
    }
}

module.exports = JWTService;