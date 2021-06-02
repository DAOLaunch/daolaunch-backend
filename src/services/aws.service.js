import { errors, jsonError, jsonSuccess, logger } from '../utils/system';
import uuid from 'uuid/v1';
import aws from 'aws-sdk';

const getDataAWS = () => {
  aws.config.update({
    accessKeyId: getEnv('S3_KEY'),
    secretAccessKey: getEnv('S3_SECRET'),
    region: getEnv('S3_REGION'),
  });
};

aws.config.setPromisesDependency(global.Promise);

class AwsService {
  /**
   * @description Sign s3
   * @param {String} file_type
   * @param {String} file_name
   */
  async signS3({ file_type, file_name }) {
    try {
      getDataAWS();

      /** Sign s3 */
      const result = await this.getSingleUrlS3({ file_type, file_name });

      return jsonSuccess(result);
    } catch (e) {
      logger.error(`${new Date().toDateString()}_ERRORS_SIGN_S3_SERVICE`, e);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /**
   * @description Sign multiple s3
   * @param {Object} files
   */
  async signMultipleS3({ files }) {
    try {
      getDataAWS();
      let s3urls = [];

      for (let i = 0; i < files.length; i++) {
        /** Sign s3 url */
        const result = await this.getSingleUrlS3(files[i]);

        s3urls.push(result);
      }

      return jsonSuccess(s3urls);
    } catch (e) {
      logger.error(`${new Date().toDateString()}_ERRORS_MULTIPLY_SIGN_S3_SERVICE`, e);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }

  /** ************************ FUNCTION IN SERVICE ******************************* */
  async getSingleUrlS3({ file_type, file_name }) {
    try {
      const s3 = new aws.S3();
      const S3_BUCKET = getEnv('S3_BUCKET');
      const fileType = file_type;
      const extension = file_name && file_name.split('.').pop();
      const name = file_name && file_name.split('.').shift() || uuid();
      const fileName = `${name}--${new Date().getTime()}.${extension}`;

      const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read',
      };

      const result = await s3.getSignedUrl('putObject', s3Params);

      return {
        signedRequest: result,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
        file_name: file_name || 'No Name'
      };
    } catch (error) {
      logger.error(`${new Date().toDateString()}_ERRORS_SIGN_S3_FUNCTION`, error);
      return jsonError(errors.SYSTEM_ERROR);
    }
  }
}

export const awsService = new AwsService();
