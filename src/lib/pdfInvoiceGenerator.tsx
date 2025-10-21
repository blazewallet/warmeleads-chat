import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { formatPrice, formatVATPercentage } from './vatCalculator';

export interface InvoicePDFData {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  packageName: string;
  industry: string;
  quantity: number;
  pricePerLead: number; // EXCL VAT in cents
  totalAmountExclVAT: number; // EXCL VAT in cents
  vatAmount: number; // VAT in cents
  totalAmountInclVAT: number; // INCL VAT in cents
  vatPercentage: number;
  currency: string;
  paymentMethod: string;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    marginBottom: 30,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#667eea',
  },
  companyDetails: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  invoiceDetails: {
    fontSize: 10,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
  },
  tableCol1: {
    width: '50%',
  },
  tableCol2: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol3: {
    width: '20%',
    textAlign: 'right',
  },
  tableCol4: {
    width: '15%',
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  totalAmount: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

// PDF Invoice Component
const InvoicePDF: React.FC<{ data: InvoicePDFData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>WarmeLeads.eu</Text>
        <Text style={styles.companyDetails}>
          KvK: 88929280{'\n'}
          Stavangerweg 21-1{'\n'}
          9723 JC Groningen{'\n'}
          Nederland{'\n'}
          info@warmeleads.eu
        </Text>
      </View>

      {/* Invoice Title */}
      <Text style={styles.invoiceTitle}>FACTUUR</Text>
      
      {/* Invoice Details */}
      <View style={styles.invoiceDetails}>
        <Text>Factuurnummer: {data.invoiceNumber}</Text>
        <Text>Factuurdatum: {new Date(data.invoiceDate).toLocaleDateString('nl-NL')}</Text>
        <Text>Ordernummer: {data.orderNumber}</Text>
      </View>

      {/* Customer Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Klantgegevens</Text>
        <Text>{data.customerName}</Text>
        {data.customerCompany && <Text>{data.customerCompany}</Text>}
        <Text>{data.customerEmail}</Text>
      </View>

      {/* Invoice Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCol1}>Omschrijving</Text>
          <Text style={styles.tableCol2}>Aantal</Text>
          <Text style={styles.tableCol3}>Prijs per stuk</Text>
          <Text style={styles.tableCol4}>Totaal</Text>
        </View>
        
        <View style={styles.tableRow}>
          <Text style={styles.tableCol1}>
            {data.packageName} - {data.industry}
          </Text>
          <Text style={styles.tableCol2}>{data.quantity}</Text>
          <Text style={styles.tableCol3}>{formatPrice(data.pricePerLead)}</Text>
          <Text style={styles.tableCol4}>{formatPrice(data.totalAmountExclVAT)}</Text>
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotaal (excl. BTW):</Text>
          <Text style={styles.totalAmount}>{formatPrice(data.totalAmountExclVAT)}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>BTW ({formatVATPercentage()}):</Text>
          <Text style={styles.totalAmount}>{formatPrice(data.vatAmount)}</Text>
        </View>
        
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Totaal (incl. BTW):</Text>
          <Text style={styles.grandTotalAmount}>{formatPrice(data.totalAmountInclVAT)}</Text>
        </View>
      </View>

      {/* Payment Info */}
      <View style={[styles.section, { marginTop: 30 }]}>
        <Text style={styles.sectionTitle}>Betaalinformatie</Text>
        <Text>Betaalmethode: {data.paymentMethod.toUpperCase()}</Text>
        <Text>Status: Betaald</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          WarmeLeads.eu | KvK: 88929280 | Stavangerweg 21-1, 9723 JC Groningen{'\n'}
          info@warmeleads.eu | www.warmeleads.eu
        </Text>
      </View>
    </Page>
  </Document>
);

/**
 * Generate PDF invoice and return as Buffer
 */
export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  const blob = await pdf(<InvoicePDF data={data} />).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

