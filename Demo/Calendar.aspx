<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void cal_SelectionChanged(object sender, EventArgs e)
    {
        cal1.Text = cal.SelectedDate.ToShortDateString();
    }

</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <asp:Calendar runat="server" ID="cal" BackColor="White" BorderColor="#999999" 
        CellPadding="4" DayNameFormat="Shortest" Font-Names="Verdana" Font-Size="8pt" 
        ForeColor="Black" Height="180px" Width="200px" 
        onselectionchanged="cal_SelectionChanged" >
        <DayHeaderStyle BackColor="#CCCCCC" Font-Bold="True" Font-Size="7pt" />
        <NextPrevStyle VerticalAlign="Bottom" />
        <OtherMonthDayStyle ForeColor="#808080" />
        <SelectedDayStyle BackColor="#666666" Font-Bold="True" ForeColor="White" />
        <SelectorStyle BackColor="#CCCCCC" />
        <TitleStyle BackColor="#999999" BorderColor="Black" Font-Bold="True" />
        <TodayDayStyle BackColor="#CCCCCC" ForeColor="Black" />
        <WeekendDayStyle BackColor="#FFFFCC" />
    </asp:Calendar>

    <asp:Literal runat="server" ID="cal1" />

</asp:Content>
