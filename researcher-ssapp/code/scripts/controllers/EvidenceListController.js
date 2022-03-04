const { WebcController } = WebCardinal.controllers;
import EvidenceService from "../services/EvidenceService.js";
const { DataSource } = WebCardinal.dataSources;


class EvidenceDataSource extends DataSource {
    constructor(data) {
        super();
        this.model.evidences = data;
        this.model.elements = 8;
        this.setPageSize(this.model.elements);
        this.model.noOfColumns = 6;
    }

    async getPageDataAsync(startOffset, dataLengthForCurrentPage) {
        console.log({startOffset, dataLengthForCurrentPage});
        if (this.model.evidences.length <= dataLengthForCurrentPage ){
            this.setPageSize(this.model.evidences.length);
        }
        else{
            this.setPageSize(this.model.elements);
        }
        let slicedData = [];
        this.setRecordsNumber(this.model.evidences.length);
        if (dataLengthForCurrentPage > 0) {
            slicedData = Object.entries(this.model.evidences).slice(startOffset, startOffset + dataLengthForCurrentPage).map(entry => entry[1]);
            console.log(slicedData)
        } else {
            slicedData = Object.entries(this.model.evidences).slice(0, startOffset - dataLengthForCurrentPage).map(entry => entry[1]);
            console.log(slicedData)
        }
        return slicedData;
    }
}


export default class EvidenceListController extends WebcController  {
    constructor(...props) {
        super(...props);

        this.model = {}
        this.model.studyID = this.getState() || {};

        this.EvidenceService = new EvidenceService();
        const getEvidences = () => {
            return new Promise ((resolve, reject) => {
                this.EvidenceService.getEvidences((err, received_evidences ) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(received_evidences)
                })
            })
        }

        getEvidences().then(data => {
            let evidences = data.filter(data => data.studyID === this.model.studyID);
            this.model.hasEvidence = evidences.length !== 0;
            this.model.evidenceDataSource = new EvidenceDataSource(evidences);
            const { evidenceDataSource } = this.model;
            this.onTagClick("prev-page", () => evidenceDataSource.goToPreviousPage());
            this.onTagClick("next-page", () => evidenceDataSource.goToNextPage());
        })

        this._attachHandlerAddEvidence();
        this._attachHandlerGoBack();
       
    }

    _attachHandlerAddEvidence(){
        this.onTagClick('new:evidence', () => {
            this.navigateToPageTag('add-evidence', this.model.studyID);
        });
    }

    _attachHandlerGoBack(){
        this.onTagClick('go:back', () => {
            this.navigateToPageTag('home');
        });
    }

   

   

}
