import geni.portal as portal
import geni.rspec.pg as pg
import geni.rspec.igext as IG

# Define profile parameters
pc = portal.Context()
request = pc.makeRequestRSpec()

tourDescription = \
"""
This profile spins up a node, installs Docker, Minikube, Skaffold, kubectl, and deploys the app automatically using skaffold.
"""
tour = IG.Tour()
tour.Description(IG.Tour.TEXT, tourDescription)
request.addTour(tour)

# Define node
node = request.RawPC("deploy-node")
node.disk_image = "urn:publicid:IDN+emulab.net+image+emulab-ops:UBUNTU22-64-STD"
node.routable_control_ip = True

bs = node.Blockstore("bs", "/mydata")
bs.size = "20GB"

# Run install + startup
node.addService(pg.Execute(shell="sh", command="sudo bash /local/repository/deploy_scripts/install_deps.sh && sudo bash /local/repository/deploy_scripts/startup.sh"))

# Print request
pc.printRequestRSpec(request)
