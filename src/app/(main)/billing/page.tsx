import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

const billingHistory = [
  { invoice: "INV001", date: "Jan 20, 2024", amount: "£99.00", status: "Paid" },
  { invoice: "INV002", date: "Feb 20, 2024", amount: "£99.00", status: "Paid" },
  { invoice: "INV003", date: "Mar 20, 2024", amount: "£99.00", status: "Pending" },
]

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="mb-4">
        <h1 className="text-3xl font-headline font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the Pro plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
                <p className="text-2xl font-bold">£99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground">Billed monthly. Your next payment is on July 20, 2024.</p>
            </div>
            <Separator />
             <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">✔ Unlimited Job Postings</li>
                <li className="flex items-center gap-2">✔ Priority Support</li>
                <li className="flex items-center gap-2">✔ Advanced Analytics</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your saved payment methods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span>💳</span>
                    <div>
                        <p className="font-medium">Visa ending in 1234</p>
                        <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                </div>
                <Button variant="outline">Edit</Button>
            </div>
            <Button>Add New Payment Method</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow key={item.invoice}>
                  <TableCell className="font-medium">{item.invoice}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Paid' ? 'default' : 'secondary'} className={item.status === 'Paid' ? 'bg-green-500/20 text-green-700 border-green-500/30' : ''}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Download</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
