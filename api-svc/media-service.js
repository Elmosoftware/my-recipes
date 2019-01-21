// @ts-check
const ServiceValidator = require("./service-validator");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CDN_CLOUD_NAME,
    api_key: process.env.CDN_API_KEY,
    api_secret: process.env.CDN_API_SECRET
});

/**
 * Media API Service
 */
class MediaService {

    constructor() {
    }

    getCarouselPictures(callback) {
        var val = new ServiceValidator();

        if (!val.validateCallback(callback)
            .isValid) {
            return (callback(val.getErrors(), {}));
        }

        cloudinary.api.resources({ type: 'upload', prefix: this._getRandomCarouselFolder(), context: true }, (err, data) => {
            
            let resources = [];

            if (!err && data && data.resources) {
                data.resources.forEach(resource => {
                    let obj = new Carousel(resource.secure_url, (resource.context && resource.context.custom) ? resource.context.custom : null);
                    resources.push(obj);
                });
            }

            callback(err, resources)
        });
    }

    /**
     * This method selects a random subfolder of Carousel pictures from the CDN.
     */
    _getRandomCarouselFolder(){
        return `${process.env.CDN_CAROUSEL_PREFIX}/${this._randomInt(1, Number(process.env.CDN_CAROUSEL_SUBFOLDERS)).toString()}`
    }

    /**
     * Returns a random integer between the specified interval.
     * @param {number} min Minimum random integer to include  in the results.
     * @param {number} max Maximum random integer to include in the results.
     * @author Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
     */
    _randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

class Carousel{
    constructor(url, metadata){
        this.url = url
        this.metadata = metadata
    }
}

module.exports = MediaService;
