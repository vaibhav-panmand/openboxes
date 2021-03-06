package org.pih.warehouse.putAway

import org.codehaus.groovy.grails.web.json.JSONObject
import org.pih.warehouse.api.Putaway
import org.pih.warehouse.core.Location
import org.pih.warehouse.order.Order
import org.pih.warehouse.picklist.Picklist
import org.pih.warehouse.requisition.Requisition

class PutAwayController {

	def pdfRenderingService

	def index = {
		redirect(action: "create")
	}

	def list = {
		redirect(action: "create")
	}

	// This template is generated by webpack during application start
	def create = {
		render(template: "/common/react")
	}


	def generatePdf = {
        log.info "Params " + params

        Putaway putaway
        JSONObject jsonObject

        if (request.method == "POST") {
            jsonObject = request.JSON
        }
		else if (params.id) {
			Order order = Order.get(params.id)
			putaway = Putaway.createFromOrder(order)
			jsonObject = new JSONObject(putaway.toJson())
		}

		renderPdf(
				template: "/putAway/print",
				model: [jsonObject:jsonObject],
				filename: "Putaway ${putaway?.putawayNumber}"
		)
	}
}
