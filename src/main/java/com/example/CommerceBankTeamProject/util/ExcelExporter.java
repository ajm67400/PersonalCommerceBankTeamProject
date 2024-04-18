package com.example.CommerceBankTeamProject.util;

import com.example.CommerceBankTeamProject.domain.ServerInfo;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;

public class ExcelExporter {

    public static void exportToExcel(List<ServerInfo> serverInfoList, String filePath) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Server Info");

        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Server Info UID", "Application Info UID", "Source Hostname", "Source IP Address",
                "Destination Hostname", "Destination IP Address", "Destination Port", "IP Status", "Created At",
                "Created By", "Modified At", "Modified By"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }

        // Populate data rows
        int rowNum = 1;
        for (ServerInfo serverInfo : serverInfoList) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(serverInfo.getServerInfoUid());
            row.createCell(1).setCellValue(serverInfo.getApplicationInfo().getAppInfoUid());
            row.createCell(2).setCellValue(serverInfo.getSourceHostname());
            row.createCell(3).setCellValue(serverInfo.getSourceIpAddress());
            row.createCell(4).setCellValue(serverInfo.getDestinationHostname());
            row.createCell(5).setCellValue(serverInfo.getDestinationIpAddress());
            row.createCell(6).setCellValue(serverInfo.getDestinationPort());
            row.createCell(7).setCellValue(serverInfo.getIpStatus());
            row.createCell(8).setCellValue(serverInfo.getCreatedAt().toString());
            row.createCell(9).setCellValue(serverInfo.getCreatedBy());
            row.createCell(10).setCellValue(serverInfo.getModifiedAt().toString());
            row.createCell(11).setCellValue(serverInfo.getModifiedBy());
        }

        // Write to file
        try (FileOutputStream fileOut = new FileOutputStream(filePath)) {
            workbook.write(fileOut);
        }

        workbook.close();
    }
}