import { Request, Response } from 'enonic-types/controller'
import { HttpRequestParams, HttpResponse } from 'enonic-types/http'
const {
  request
} = __non_webpack_require__('/lib/http-client')

exports.post = (req: Request): Response => {
  const formData: ContactFormData = JSON.parse(req.body)
  log.info('\n\n## data\n--------------\n%s\n', JSON.stringify(formData, null, 4))

  const secret: string | null = app.config && app.config['RECAPTCHA_SECRET_KEY'] ? app.config['RECAPTCHA_SECRET_KEY'] : null
  if (secret) {
    const requestParams: HttpRequestParams = {
      url: ' https://www.google.com/recaptcha/api/siteverify',
      method: 'POST',
      queryParams: {
        secret,
        response: formData.token
      }
    }
    const response: HttpResponse = request(requestParams)
    const recaptchaInfo: RecaptchaResponse | null = response.body ? JSON.parse(response.body) : null

    if (recaptchaInfo && recaptchaInfo.success && recaptchaInfo.score > 0.5 && recaptchaInfo.action === 'submitContactForm') {
      return {
        status: 200,
        contentType: 'application/json',
        body: {
          success: true,
          message: 'Din henvendelse er videresendt'
        }
      }
    }
  }

  return {
    status: 400,
    contentType: 'application/json',
    body: {
      success: false,
      message: 'Henvendelsen din ble desverre ikke godkjent, prøv igjen'
    }
  }
}

interface ContactFormData {
  token: string;
}

interface RecaptchaResponse {
  success: boolean;
  // eslint-disable-next-line camelcase
  challenge_ts: string;
  hostname: string;
  score: number;
  action: string;
}
