import Util from '../utils/Utils'
import RequestService from '../services/RequestService'
import PartyService from '../services/PartyService'
import UserService from '../services/UserService'
const util = new Util()

class RequestController {
    static async sendPartyRequest(req, res) {
        const user = req.user
        const party_id = req.params.party_id
        try {
            const party = await PartyService.searchParty(party_id)
            if (!party) {
                util.setError(404, 'The party you are requesting to attend does not exist.')
                return util.send(res)
            }
            if (party.host_id === user.id) {
                util.setError(400, 'You cannot request to attend your own party.')
                return util.send(res)
            }
            const request = await RequestService.checkRequestExists(user.id, party.id)
            if (request) {
                util.setError(400, 'You have already requested to attend this party.')
                return util.send(res)
            }
            const newRequest = {
                party_id: party.id,
                guest_id: user.id,
            }
            const sentRequest = await RequestService.sendPartyRequest(newRequest)
            util.setSuccess(201, 'Request successfully sent', sentRequest)
            return util.send(res)
        } catch (error) {
            util.setError(400, error.message)
            return util.send(res)
        }
    }

    static async getPartyRequests(req, res) {
        const user = req.user
        const { party_id } = req.params
        try {
            const party = await PartyService.searchParty(party_id)
            if (!party) {
                util.setError(404, 'Party does not exist.')
                return util.send(res)
            }
            if (party.host_id !== user.id) {
                util.setError(400, 'You can only view requests for parties you created.')
                return util.send(res)
            }
            const requests = await RequestService.getPartyRequests(party.id)
            util.setSuccess(200, 'Party requests', requests)
            return util.send(res)
        } catch (error) {
            util.setError(400, error.message)
            return util.send(res)
        }
    }

    static async withdrawPartyRequest(req, res) {
        const user = req.user
        const { request_id } = req.params
        try {
            const request = await RequestService.findPartyRequest(request_id)
            if (!request) {
                util.setError(404, 'That party request does not exist.')
                return util.send(res)
            }
            if (request.guest_id !== user.id) {
                util.setError(401, 'You can only withdraw your own requests.')
                return util.send(res)
            }
            await request.destroy()
            util.setSuccess(200, 'Party request successfully withdrawn')
            return util.send(res)
        } catch (error) {
            util.setError(400, error.message)
            return util.send(res)
        }
    }

    static async modifyPartyRequest(req, res) {
        const { user, params } = req
        const { party_id, request_id, status } = params

        try {
            const party = await PartyService.searchParty(party_id)
            if (!party) {
                util.setError(404, 'Party with that request does not exist.')
                return util.send(res)
            }
            if (party.host_id !== user.id) {
                util.setError(400, 'You cannot alter a request for a party you did not create.')
                return util.send(res)
            }
            const request = await RequestService.findPartyRequest(request_id)
            if (!request) {
                util.setError(404, 'The request you are trying to alter does not exist.')
                return util.send(res)
            }
            const guest = await UserService.findUser(request.guest_id)
            await RequestService.modifyPartyRequest(request.id, status)
            if (status === 'accepted') {
                await party.addGuests(guest)
            }
            util.setSuccess(200, 'Party request altered.')
            return util.send(res)
        } catch (error) {
            util.setError(400, error.message)
            return util.send(res)
        }
    }
}

export default RequestController
