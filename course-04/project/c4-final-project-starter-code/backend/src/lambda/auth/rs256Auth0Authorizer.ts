
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'

const appCert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJMIuFJH83bRIcMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi05ZTRvaWlxNS51cy5hdXRoMC5jb20wHhcNMjIxMDA2MTUyNzQ0WhcN
MzYwNjE0MTUyNzQ0WjAkMSIwIAYDVQQDExlkZXYtOWU0b2lpcTUudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuWbIGJtCQltO3qxa
7B5RRAMLBWxNliKJXxWETxt8VqbYiIH+mTkfQoZur3hNYb3P3siUnwLQpoe2Y47/
0EAMeN75ouu7DMuN7GJ/TUKyVk/oDhFM0krhtMqkr2Mdql2eDnVMD+9j22lEQgKA
peI7DkRdroBgEDwbMf5Xih4fAKtW78/V+6mTANiCq5CUDG9QawyvvEaNkB4xthlo
iwLW8E7VOgCw7PUhAbf/JGvOKkbhkTh1PVRZTnpf2lD7zohoPC59UqXgJGsK6TtG
j3X+kKjb5Jv/P4H77fTy3i76yxwHtPeTu42VMIJa8/5UTaW40gFY8y3EeNDH8pwR
qn8tUQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQk7mTbVUv3
D0TCD5ndCbfaokDCvDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ACEMgejuzjQ4ox9qYZrz9qe3YNEwJQWmzG1TUeDoLXA3yAIiWV1Wjd5yBl1O2U49
coVXNN2a4dJkxHMqPxEM9p7Nl4GcTtMHnQil38AvIvbEBUSD774byOrexO8eKNWY
/wI4k+qeEeFrSBcrtE1PtmQd+k9kfk/4hzM72NbzadxWeLTUNWFiajzNok7DHWIU
BL+N6hzTP8tXJOCckQPGqxJUOd2DvHT059CHJGiDu5TBDDfg6+uB2iXg1ppVY4WY
yhH4ryaanNbGdOfbI2xBVDvRTaGOmWA5qBQ3kvNbvviU4D+p6N8Z5TXuO4dm13XD
xZEq7YpR5w6EnRavURLCf5c=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, appCert, { algorithms: ['RS256'] }) as JwtPayload
}
